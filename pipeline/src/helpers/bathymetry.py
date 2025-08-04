import requests
from shapely import Point

from config import BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, PROXIES


def get_depth(lon: float, lat: float) -> float:
    wkt = Point(lon, lat).wkt
    response = requests.get(
        BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, params={"geom": wkt}, proxies=PROXIES
    )
    response.raise_for_status()
    data = response.json()
    return data.get("avg")
