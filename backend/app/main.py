"""FastAPI REST API for Antarctic navigation decision support."""

import sys
import json
import logging
import time
import json
from collections import defaultdict, deque
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse
import numpy as np
from ml_engine.models.iceberg_drift import IcebergDriftModel
from backend.app.llm_agent import generate_captain_briefing
from routing.route_comparator import generate_route_options
from backend.core.config import settings
from backend.core.security import require_api_key
from backend.db.session import SessionLocal, init_db
from backend.db.models import RouteAudit
from data_pipeline.ingest_environmental import fetch_usnic_icebergs, forecast_active_icebergs

ACTIVE_ICEBERG_GRID_POSITIONS = [(155, 205)]

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

# Import inference pipeline
try:
	from ml_engine.inference.ice_forecast import generate_7day_forecast
	HAS_ML = True
except ImportError:
	HAS_ML = False


app = FastAPI(
	title=settings.PROJECT_NAME,
	version="1.0.0",
	description="Real-time ice forecasting and ship route optimization for Antarctic operations"
)
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.CORS_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
init_db()

logger = logging.getLogger("navigation_api")
logging.basicConfig(level=logging.INFO)
request_times: dict[str, deque[float]] = defaultdict(deque)


@app.middleware("http")
async def request_logging_and_rate_limit(request, call_next):
	client = request.client.host if request.client else "unknown"
	now = time.monotonic()
	times = request_times[client]
	while times and now - times[0] > 60:
		times.popleft()
	if len(times) >= 120:
		return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)
	times.append(now)
	started = time.perf_counter()
	response = await call_next(request)
	logger.info(json.dumps({"method": request.method, "path": request.url.path, "status": response.status_code, "duration_ms": round((time.perf_counter() - started) * 1000, 2)}))
	return response


class RouteRequest(BaseModel):
	"""Request model for route computation."""
	start_coords: list[int] = Field(..., min_length=2, max_length=2)
	goal_coords: list[int] = Field(..., min_length=2, max_length=2)
	forecast_day: int = Field(1, ge=1, le=7)
	vessel_ice_class: Optional[str] = Field("PC5", description="Polar Class: PC1, PC3, PC5, PC7, or Standard")


class Route(BaseModel):
	"""Single route option with metrics."""
	name: str  # "Safest", "Fuel-Optimal", "Shortest"
	path: list  # List of [row, col] waypoints
	distance: float
	ice_risk_score: float
	estimated_fuel_tons: float
	minimum_speed_knots: float = 0.0
	peak_power_kw: float = 0.0


class RouteResponse(BaseModel):
	"""Response with multiple route options."""
	forecast_day: int
	origin: list
	destination: list
	routes: list[Route]
	ice_grid_stats: dict
	vessel_ice_class: str = "PC5"


class CopilotRequest(BaseModel):
	"""Request model for captain briefing generation."""
	query: str
	start_coords: list
	goal_coords: list
	forecast_day: int = 1


@app.get("/")
def read_root() -> dict:
	"""Health check endpoint."""
	return {
		"status": "Online",
		"system": "Antarctic Navigation API",
		"version": "1.0.0"
	}


@app.get("/health")
def health_check() -> dict:
	"""API health status."""
	return {"status": "healthy", "service": "navigation-api"}


@app.post("/api/v1/compute-routes")
def compute_routes(req: RouteRequest, _: None = Depends(require_api_key)) -> RouteResponse:
	"""
	Computes Safest, Fuel-Optimal, and Shortest routes over ML-predicted ice fields.
	
	Args:
		req: RouteRequest with start/goal coordinates and forecast day
	
	Returns:
		RouteResponse with multiple route options and metrics
	"""
	if not HAS_ML:
		raise HTTPException(
			status_code=500,
			detail="ML pipeline not available"
		)
	
	forecast_path = PROJECT_ROOT / "data" / "processed" / "ice_forecast_7day.npy"
	
	# Generate forecast if missing
	if not forecast_path.exists():
		print("Forecast not found, generating...")
		generate_7day_forecast()
	
	forecast_grid = np.load(forecast_path)
	
	if req.forecast_day < 1 or req.forecast_day > forecast_grid.shape[0]:
		raise HTTPException(
			status_code=400,
			detail=f"forecast_day must be between 1 and {forecast_grid.shape[0]}"
		)
	
	# Get ice grid for the requested forecast day (0-indexed)
	day_grid = forecast_grid[req.forecast_day - 1]
	
	if len(req.start_coords) != 2 or len(req.goal_coords) != 2:
		raise HTTPException(
			status_code=400,
			detail="start_coords and goal_coords must be [row, col] pairs"
		)

	start = tuple(req.start_coords)
	goal = tuple(req.goal_coords)
	grid_height, grid_width = day_grid.shape
	for name, point in (("start_coords", start), ("goal_coords", goal)):
		if not all(isinstance(value, int) for value in point):
			raise HTTPException(status_code=400, detail=f"{name} must contain integer grid coordinates")
		if not (0 <= point[0] < grid_height and 0 <= point[1] < grid_width):
			raise HTTPException(
				status_code=400,
				detail=f"{name} must be within grid bounds [0-{grid_height - 1}, 0-{grid_width - 1}]"
			)
	
	# Compute grid statistics
	grid_stats = {
		"mean_ice_concentration": float(day_grid.mean()),
		"max_ice_concentration": float(day_grid.max()),
		"min_ice_concentration": float(day_grid.min()),
		"grid_shape": day_grid.shape,
	}
	
	active_icebergs = fetch_usnic_icebergs()
	iceberg_positions = [
		(int(item["grid_row"]), int(item["grid_column"]))
		for item in active_icebergs
		if "grid_row" in item and "grid_column" in item
	] or ACTIVE_ICEBERG_GRID_POSITIONS
	route_options = generate_route_options(forecast_grid, start, goal, iceberg_positions, req.vessel_ice_class or "PC5")
	route_labels = {"safest": "Safest", "fuel_optimal": "Fuel-Optimal", "shortest": "Shortest"}
	routes = [
		Route(name=route_labels[name], path=[list(point) for point in option["path"]], distance=option["metrics"]["distance_km"], ice_risk_score=option["metrics"]["avg_ice_risk"], estimated_fuel_tons=option["metrics"]["estimated_fuel_tons"], minimum_speed_knots=option["metrics"]["minimum_speed_knots"], peak_power_kw=option["metrics"]["peak_power_kw"])
		for name, option in route_options.items()
	]
	
	result = RouteResponse(
		forecast_day=req.forecast_day,
		origin=list(start),
		destination=list(goal),
		routes=routes,
		ice_grid_stats=grid_stats,
		vessel_ice_class=req.vessel_ice_class or "PC5",
	)
	with SessionLocal() as session:
		session.add(RouteAudit(
			forecast_day=req.forecast_day,
			vessel_ice_class=req.vessel_ice_class or "PC5",
			origin=json.dumps(list(start)),
			destination=json.dumps(list(goal)),
			iceberg_positions=json.dumps(iceberg_positions),
			selected_route="",
			estimated_fuel_tons=min((route.estimated_fuel_tons for route in routes if route.path), default=0.0),
		))
		session.commit()
	return result


@app.get("/api/v1/forecast/icebergs")
def get_iceberg_forecasts() -> dict:
	"""Return a seven-day drift trajectory for the tracked sample iceberg."""
	active = forecast_active_icebergs()
	if active:
		return {"icebergs": active}
	model = IcebergDriftModel()
	wind_u = np.array([2.5, 3.0, 1.5, -0.5, -2.0, 1.0, 3.5])
	wind_v = np.array([1.0, 1.2, 0.8, 2.0, 1.5, -0.5, 0.0])
	current_u = np.array([0.2, 0.25, 0.22, 0.18, 0.15, 0.2, 0.25])
	current_v = np.array([0.05, 0.08, 0.06, 0.04, 0.02, 0.05, 0.07])
	trajectory = model.predict_trajectory(-69.5, 39.5, wind_u, wind_v, current_u, current_v)
	return {
		"iceberg_id": "A-23a_TRACK",
		"initial_position": {"lat": -69.5, "lon": 39.5},
		"grid_position": list(ACTIVE_ICEBERG_GRID_POSITIONS[0]),
		"trajectory": trajectory,
	}


@app.get("/api/v1/forecast/sea-ice")
def get_sea_ice_forecast_metadata() -> dict:
	"""Return metadata and summary statistics for the seven-day forecast."""
	forecast_path = PROJECT_ROOT / "data" / "processed" / "ice_forecast_7day.npy"
	if not forecast_path.exists():
		if not HAS_ML:
			raise HTTPException(status_code=500, detail="ML pipeline unavailable")
		generate_7day_forecast()
	forecast_grid = np.load(forecast_path)
	return {
		"forecast_days": int(forecast_grid.shape[0]),
		"grid_shape": list(forecast_grid.shape[1:]),
		"min_concentration": float(forecast_grid.min()),
		"max_concentration": float(forecast_grid.max()),
		"mean_concentration": float(forecast_grid.mean()),
	}


@app.get("/api/v1/forecast/{day}")
def get_forecast(day: int) -> dict:
	"""
	Retrieve sea-ice forecast for a specific day.
	
	Args:
		day: Forecast day (1-7)
	
	Returns:
		Grid statistics and metadata
	"""
	forecast_path = PROJECT_ROOT / "data" / "processed" / "ice_forecast_7day.npy"
	
	if not forecast_path.exists():
		if not HAS_ML:
			raise HTTPException(status_code=500, detail="ML pipeline unavailable")
		generate_7day_forecast()
	
	forecast_grid = np.load(forecast_path)
	
	if day < 1 or day > forecast_grid.shape[0]:
		raise HTTPException(status_code=400, detail="Invalid forecast day")
	
	day_data = forecast_grid[day - 1]
	
	return {
		"day": day,
		"grid_shape": day_data.shape,
		"mean_concentration": float(day_data.mean()),
		"max_concentration": float(day_data.max()),
		"min_concentration": float(day_data.min()),
		"high_risk_area_fraction": float((day_data > 0.8).sum() / day_data.size),
	}


@app.post("/api/v1/copilot/briefing")
def copilot_briefing(req: CopilotRequest, _: None = Depends(require_api_key)) -> dict:
	"""Generate an operational briefing from a live route evaluation."""
	route_response = compute_routes(RouteRequest(
		start_coords=req.start_coords,
		goal_coords=req.goal_coords,
		forecast_day=req.forecast_day,
	))
	briefing = generate_captain_briefing(req.query, route_response.model_dump())
	return {
		"query": req.query,
		"briefing": briefing,
		"route_summary": route_response,
	}


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8000)
