"""Generate realistic synthetic Antarctic sea-ice concentration data."""

from pathlib import Path
import numpy as np

try:
	import rasterio
	from rasterio.transform import Affine
	HAS_RASTERIO = True
except ImportError:
	HAS_RASTERIO = False


def generate_synthetic_sea_ice_frames() -> None:
	"""Generate five daily Antarctic sea-ice concentration frames.
	
	Creates synthetic GeoTIFF files with realistic ice concentration patterns
	for EPSG:3031 Antarctic Polar Stereographic projection.
	Values: 0-200 represent ice concentration (0-100%), 251+ are land masks.
	"""
	project_root = Path(__file__).resolve().parents[1]
	output_dir = project_root / "data" / "raw" / "nsidc"
	output_dir.mkdir(parents=True, exist_ok=True)

	print(f"Generating synthetic satellite frames to {output_dir}...")
	
	# NSIDC grid: 316x332 pixels (southern hemisphere polar stereo)
	grid_shape = (316, 332)
	
	for day in range(1, 6):
		filename = f"S_202301{day:02d}_concentration_v3.0.tif"
		filepath = output_dir / filename
		
		if filepath.exists():
			print(f"Already exists: {filename}")
			continue
		
		print(f"Generating: {filename}...")
		
		# Create realistic ice concentration patterns
		# Ice concentration higher near pole, lower at equatorward edge
		y, x = np.ogrid[:grid_shape[0], :grid_shape[1]]
		center_y, center_x = grid_shape[0] // 2, grid_shape[1] // 2
		distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
		
		# Core ice region (high concentration) with daily variability
		ice_conc = 200 * np.exp(-distance / 80) * (0.85 + 0.15 * np.sin(day))
		ice_conc = np.clip(ice_conc, 0, 200).astype(np.uint8)
		
		# Add land masks and pole hole (values 251-255)
		land_mask = distance > 140
		ice_conc = np.where(land_mask, 251, ice_conc)
		
		# Pole hole (top-left quadrant)
		pole_hole = (x < 80) & (y < 80)
		ice_conc = np.where(pole_hole, 254, ice_conc)
		
		if HAS_RASTERIO:
			# Save as GeoTIFF with proper EPSG:3031 geospatial metadata
			# NSIDC grid: 25km resolution, EPSG:3031
			transform = Affine.identity() * Affine.scale(25000, -25000)
			
			with rasterio.open(
				filepath, 'w',
				driver='GTiff',
				height=grid_shape[0],
				width=grid_shape[1],
				count=1,
				dtype=ice_conc.dtype,
				crs='EPSG:3031',
				transform=transform,
			) as dst:
				dst.write(ice_conc, 1)
			print(f"Saved (GeoTIFF): {filename}")
		else:
			# Fallback: save as raw binary if rasterio unavailable
			ice_conc.tofile(filepath.with_suffix('.bin'))
			print(f"Saved (binary, no geospatial metadata): {filename}")
			print(f"Note: Install rasterio for proper GeoTIFF export: pip install rasterio")


if __name__ == "__main__":
	generate_synthetic_sea_ice_frames()
