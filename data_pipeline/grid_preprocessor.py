"""Normalize NSIDC sea-ice concentration data into a NumPy tensor."""

import glob
from pathlib import Path

import numpy as np

try:
	import rasterio
	HAS_RASTERIO = True
except ImportError:
	HAS_RASTERIO = False


NSIDC_GRID_SHAPE = (316, 332)  # Southern hemisphere polar stereo grid size


def process_geotiffs(
	raw_dir: str | Path = "data/raw/nsidc",
	output_path: str | Path = "data/processed/sea_ice_tensors.npy",
) -> None:
	"""Read NSIDC frames and save values bounded to the range [0.0, 1.0].
	
	Handles both GeoTIFF (.tif) and binary (.bin) source formats.
	NSIDC Scale: 0 to 200 = 0.0 to 1.0 Ice Concentration
	Values > 200 are land, missing, or pole-hole masks (set to 0.0).
	"""
	project_root = Path(__file__).resolve().parents[1]
	raw_path = project_root / raw_dir
	output_file = project_root / output_path
	output_file.parent.mkdir(parents=True, exist_ok=True)

	# Look for both .tif (GeoTIFF) and .bin (binary) files
	tif_files = sorted(glob.glob(str(raw_path / "*.tif")))
	bin_files = sorted(glob.glob(str(raw_path / "*.bin")))
	files = tif_files + bin_files
	
	if not files:
		raise FileNotFoundError(
			f"No GeoTIFF or binary files found in {raw_path}. "
			f"Run download_nsidc.py first."
		)

	tensor_list = []
	print(f"Preprocessing {len(files)} satellite frames...")
	
	for filepath in files:
		filepath_obj = Path(filepath)
		
		if filepath_obj.suffix == '.tif' and HAS_RASTERIO:
			# Read GeoTIFF with rasterio
			with rasterio.open(filepath) as source:
				data = source.read(1).astype(np.float32)
		elif filepath_obj.suffix == '.bin':
			# Read binary format (fallback from download_nsidc.py)
			data = np.fromfile(filepath, dtype=np.uint8).reshape(NSIDC_GRID_SHAPE)
			data = data.astype(np.float32)
		else:
			print(f"Skipping {filepath_obj.name} (unsupported format)")
			continue
		
		# NSIDC Scale: 0 to 200 = 0.0 to 1.0 Ice Concentration
		# Values > 200 are land, missing, or pole-hole masks (set to 0.0)
		ice_concentration = np.where(data <= 200, data / 200.0, 0.0)
		ice_concentration = np.clip(ice_concentration, 0.0, 1.0)
		tensor_list.append(ice_concentration)

	stacked_tensor = np.stack(tensor_list, axis=0)
	np.save(output_file, stacked_tensor)
	print(f"✅ Saved processed tensor to {output_file} | Shape: {stacked_tensor.shape}")
	print(f"   Data range: [{stacked_tensor.min():.4f}, {stacked_tensor.max():.4f}]")


if __name__ == "__main__":
	process_geotiffs()
