from typing import Tuple

from pyproj import Geod


def estimate_current_position(
    last_latitude: float,
    last_longitude: float,
    course: float,
    speed: float,
    time_since_last_position: float,
    max_time_since_last_position: float = 2,
    on_error: str = "ignore",
) -> Tuple[float, float]:
    """Estimate the current position of a vessel based on its last position, course and
    speed. If the last position is older than max_time_since_last_position, returns
    None.

    Args:
        last_latitude (float): last known latitude of vessel
        last_longitude (float): last known longitude of vessel
        course (float): last known route of vessel in degrees
        speed (float): last known speed of vessel in nots
        time_since_last_position (float): time since last known position of vessel, in hours
        max_time_since_last_position (float): maximum time in hours since last position,
            after which the estimation is not performed (returns None instead).
            Defaults to 2.
        on_error (str): 'ignore' or 'raise'.

    Returns:
        float: estimated current latitude
        float: estimated current longitude
    """
    geod = Geod(ellps="WGS84")
    if time_since_last_position > 2:
        lat, lon = None, None
    else:
        try:
            distance = speed * time_since_last_position * 1852
            lon, lat, _ = geod.fwd(last_longitude, last_latitude, course, distance)
        except:
            if on_error == "ignore":
                lat, lon = None, None
            else:
                raise
    return lat, lon
