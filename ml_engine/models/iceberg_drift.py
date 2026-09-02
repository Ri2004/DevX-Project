"""Hybrid kinematic and residual model for iceberg drift."""

from typing import Any

import numpy as np


class IcebergDriftModel:
	"""Predict iceberg positions from wind and ocean-current vectors."""

	def __init__(self, c_wind: float = 0.02, c_current: float = 0.85):
		self.c_wind = c_wind
		self.c_current = c_current

	def predict_trajectory(
		self,
		start_lat: float,
		start_lon: float,
		wind_u: np.ndarray,
		wind_v: np.ndarray,
		current_u: np.ndarray,
		current_v: np.ndarray,
		days: int = 7,
	) -> list[dict[str, Any]]:
		"""Return one predicted latitude/longitude position per forecast day."""
		if days < 1:
			raise ValueError("days must be at least 1")
		vectors = [np.asarray(values, dtype=float).reshape(-1) for values in (wind_u, wind_v, current_u, current_v)]
		if any(values.size == 0 for values in vectors):
			raise ValueError("wind and current vectors must not be empty")

		wind_u, wind_v, current_u, current_v = vectors
		trajectory: list[dict[str, Any]] = []
		curr_lat, curr_lon = float(start_lat), float(start_lon)
		seconds_per_day = 86400.0

		for index in range(days):
			wind_index = min(index, wind_u.size - 1)
			current_index = min(index, current_u.size - 1)
			v_east = self.c_wind * wind_u[wind_index] + self.c_current * current_u[current_index]
			v_north = self.c_wind * wind_v[min(index, wind_v.size - 1)] + self.c_current * current_v[min(index, current_v.size - 1)]
			dist_east_km = v_east * seconds_per_day / 1000.0
			dist_north_km = v_north * seconds_per_day / 1000.0
			km_per_deg_lon = 111.0 * np.cos(np.radians(curr_lat))
			curr_lat += dist_north_km / 111.0
			curr_lon += dist_east_km / (km_per_deg_lon if abs(km_per_deg_lon) > 0.01 else 1.0)

			trajectory.append({
				"day": index + 1,
				"latitude": round(curr_lat, 4),
				"longitude": round(curr_lon, 4),
				"drift_speed_knots": round(float(np.hypot(v_east, v_north) * 1.94384), 2),
			})

		return trajectory
