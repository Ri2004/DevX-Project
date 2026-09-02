"""Download consecutive Antarctic sea-ice concentration frames from NSIDC."""

import os
import sys
from datetime import date, timedelta
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import numpy as np
import requests

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.core.config import settings

def extract_nsidc_array(path: str | Path) -> np.ndarray:
    """Extract a standard sea-ice concentration variable from a NetCDF file."""
    try:
        import xarray as xr
    except ImportError as error:
        raise ImportError("Install xarray to extract NetCDF NSIDC data") from error
    with xr.open_dataset(path) as dataset:
        for variable in ("seaice_conc", "cdr_seaice_conc"):
            if variable in dataset:
                return np.asarray(dataset[variable].squeeze().values, dtype=np.float32)
        raise ValueError("NetCDF contains neither seaice_conc nor cdr_seaice_conc")


DEFAULT_URL_TEMPLATE = (
    "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/{year}/"
    "{month:02d}_{month_name}/{filename}"
)


def generate_synthetic_sea_ice_frames(days: int = 30, output_dir: str | Path = "data/raw/nsidc") -> list[Path]:
    """Generate production-scale spatial fixtures when FORCE_SYNTHETIC is enabled."""
    output_path = PROJECT_ROOT / output_dir
    output_path.mkdir(parents=True, exist_ok=True)
    rows, columns = np.indices((316, 332), dtype=float)
    center_row, center_column = 158.0, 166.0
    distance = np.hypot(rows - center_row, columns - center_column)
    paths: list[Path] = []
    for day in range(days):
        stamp = (date(2023, 1, 1) + timedelta(days=day)).strftime("%Y%m%d")
        path = output_path / f"S_{stamp}_concentration_v3.0.bin"
        seasonal = 0.88 + 0.08 * np.sin(day / 7.0)
        gradient = 200.0 * np.exp(-distance / 105.0) * seasonal
        wave = 12.0 * np.sin(columns / 18.0 + day / 3.0) + 8.0 * np.cos(rows / 27.0)
        frame = np.clip(gradient + wave, 0.0, 200.0).astype(np.uint8)
        frame[(distance > 142.0) | ((rows < 18) & (columns < 70))] = 253
        frame[(rows < 28) & (columns < 28)] = 251
        frame.tofile(path)
        paths.append(path)
    return paths


def download_nsidc_frames(
    start_date: date = date(2023, 1, 1),
    days: int = 30,
    output_dir: str | Path = "data/raw/nsidc",
    url_template: str | None = None,
) -> list[Path]:
    """Download daily NSIDC-0051/G02135 south-polar files.

    Set ``NSIDC_URL_TEMPLATE`` when using a different NSIDC collection or mirror.
    The template receives year, month, month_name, day, date and filename.
    """
    if days < 1:
        raise ValueError("days must be at least 1")
    output_path = PROJECT_ROOT / output_dir
    output_path.mkdir(parents=True, exist_ok=True)
    template = url_template or os.environ.get("NSIDC_URL_TEMPLATE", DEFAULT_URL_TEMPLATE)
    filename_template = os.environ.get("NSIDC_FILENAME_TEMPLATE", "S_{date}_concentration_v3.0.tif")
    downloaded: list[Path] = []
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 AntarcticNavigation/1.0"})
    if settings.NASA_EARTHDATA_USER and settings.NASA_EARTHDATA_PASS:
        session.auth = (settings.NASA_EARTHDATA_USER, settings.NASA_EARTHDATA_PASS)

    for offset in range(days):
        current = start_date + timedelta(days=offset)
        stamp = current.strftime("%Y%m%d")
        filename = filename_template.format(date=stamp, year=current.year, month=current.month, day=current.day)
        target = output_path / filename
        if target.exists() and target.stat().st_size > 0:
            downloaded.append(target)
            continue
        url = template.format(
            year=current.year,
            month=current.month,
            month_name=current.strftime("%b").title(),
            day=current.day,
            date=stamp,
            filename=filename,
        )
        try:
            response = session.get(url, timeout=60)
            response.raise_for_status()
            target.write_bytes(response.content)
            downloaded.append(target)
            print(f"Downloaded {filename}")
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            if target.exists():
                target.unlink()
            print(f"Failed {filename} from {url}: {error}")

    if len(downloaded) < days:
        local_files = sorted(path for suffix in ("*.nc", "*.nc4", "*.tif", "*.tiff") for path in output_path.glob(suffix))
        if len(local_files) >= days:
            print(f"Network unavailable; using {days} local NSIDC files")
            return local_files[:days]
        print("No complete local NSIDC set found; generating offline synthetic frames")
        return generate_synthetic_sea_ice_frames(days, output_dir)
    return downloaded


if __name__ == "__main__":
    if os.environ.get("FORCE_SYNTHETIC", "") == "1":
        print("FORCE_SYNTHETIC=1: generating 30 synthetic spatial frames")
        generate_synthetic_sea_ice_frames()
    else:
        download_nsidc_frames()
