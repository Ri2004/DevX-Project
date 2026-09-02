"""FastAPI REST API for Antarctic navigation decision support."""

import sys
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

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
	title="Antarctic Navigation Decision Support API",
	version="1.0.0",
	description="Real-time ice forecasting and ship route optimization for Antarctic operations"
)


class RouteRequest(BaseModel):
	"""Request model for route computation."""
	start_coords: list  # [row, col] in grid
	goal_coords: list   # [row, col] in grid
	forecast_day: int = 1  # 1 to 7


class Route(BaseModel):
	"""Single route option with metrics."""
	name: str  # "Safest", "Fuel-Optimal", "Shortest"
	path: list  # List of [row, col] waypoints
	distance: float
	ice_risk_score: float
	estimated_fuel_tons: float


class RouteResponse(BaseModel):
	"""Response with multiple route options."""
	forecast_day: int
	origin: list
	destination: list
	routes: list[Route]
	ice_grid_stats: dict


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
def compute_routes(req: RouteRequest) -> RouteResponse:
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
	
	# Generate 3 example routes (placeholder until routing algorithms implemented)
	# In production, these would use dynamic_astar with different cost functions
	routes = [
		Route(
			name="Safest",
			path=[[start[0], start[1]], [goal[0], goal[1]]],  # Placeholder straight line
			distance=np.sqrt((goal[0]-start[0])**2 + (goal[1]-start[1])**2) * 25.0,  # km (25km per grid cell)
			ice_risk_score=float(day_grid[start[0]:goal[0], start[1]:goal[1]].mean()),
			estimated_fuel_tons=50.0,
		),
		Route(
			name="Fuel-Optimal",
			path=[[start[0], start[1]], [goal[0], goal[1]]],
			distance=np.sqrt((goal[0]-start[0])**2 + (goal[1]-start[1])**2) * 25.0,
			ice_risk_score=float(day_grid[start[0]:goal[0], start[1]:goal[1]].mean()) * 1.1,
			estimated_fuel_tons=40.0,
		),
		Route(
			name="Shortest",
			path=[[start[0], start[1]], [goal[0], goal[1]]],
			distance=np.sqrt((goal[0]-start[0])**2 + (goal[1]-start[1])**2) * 25.0,
			ice_risk_score=float(day_grid[start[0]:goal[0], start[1]:goal[1]].mean()) * 1.2,
			estimated_fuel_tons=60.0,
		),
	]
	
	return RouteResponse(
		forecast_day=req.forecast_day,
		origin=list(start),
		destination=list(goal),
		routes=routes,
		ice_grid_stats=grid_stats,
	)


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


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8000)
