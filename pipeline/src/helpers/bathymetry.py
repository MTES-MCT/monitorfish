from shapely import Point

from config import BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, PROXIES
from src.helpers.requests_rate_limiter import RateLimitedSession


def get_depth(lon: float, lat: float, session: RateLimitedSession) -> float:
    wkt = Point(lon, lat).wkt
    response = session.get(
        BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, params={"geom": wkt}, proxies=PROXIES
    )
    response.raise_for_status()
    data = response.json()
    return data.get("avg")
