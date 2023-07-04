from dataclasses import dataclass
from datetime import timedelta
from typing import Iterable, Set, Tuple, Union
from urllib.parse import quote

import h3
import numpy as np
import pandas as pd
import requests
from pyproj import Geod
from shapely.geometry import MultiPolygon, Polygon

from config import GOOGLE_API_TOKEN, LOCATIONIQ_TOKEN
from src.pipeline.helpers.dates import get_datetime_intervals
from src.pipeline.processing import rows_belong_to_sequence, zeros_ones_to_bools


@dataclass
class Position:
    latitude: float
    longitude: float


@dataclass
class PositionRepresentation:
    """
    Representation of a position with latitude and longitude in human readable format.
    """

    latitude: str
    longitude: str


def coordinate_to_dms(coord: float) -> Tuple[int, float, int, int]:
    """
    Takes a coordinate and return the corresponding degrees, minutes_decimal, minutes
    and seconds. The sign is not taken into account - only returns positive values.

    Args:
        coord (float): latitude or longitude coordinate value

    Returns:
        Tuple[int, float, int, int]: degrees, minutes_decimal, minutes, seconds

    Examples:
        >>> coordinate_to_dms(45.123)
        (45, 7.379999999999853, 7, 23)
        >>> coordinate_to_dms(-45.123)
        (45, 7.379999999999853, 7, 23)
    """
    abs_coord = abs(coord)

    degrees = int(abs_coord)

    decimal_part = abs_coord - degrees
    minutes_decimal = decimal_part * 60
    minutes = int(minutes_decimal)

    seconds = round((minutes_decimal - minutes) * 60)
    return degrees, minutes_decimal, minutes, seconds


def position_to_position_representation(
    p: Position, representation_type: str = "DMS"
) -> PositionRepresentation:
    """
    Converts a `Position` to a `PositionRepresentation` in the designated
    `representation_type`.

    Args:
        p (Position): input `Position`
        representation_type (str): "DMS" or "DMD". Defaults to "DMS".

    Returns:
        PositionRepresentation

    Raises:
        ValueError : if :

          - `lat` is greater than 90.0 and less than -90.0
          - `lon` is greater than 180.0 and less than -180.0
          - `representation_type` is not 'DMD' or 'DMS'.

    """
    lat = p.latitude
    lon = p.longitude

    try:
        assert -90 <= lat <= 90
    except AssertionError:
        raise ValueError("Latitude must be between -90.0 and +90.0")

    try:
        assert -180 <= lon <= 180
    except AssertionError:
        raise ValueError("Longitude must be between -180.0 and +180.0")

    north_south = "N" if lat >= 0 else "S"
    east_west = "E" if lon >= 0 else "W"

    lat_d, lat_md, lat_m, lat_s = coordinate_to_dms(lat)
    lon_d, lon_md, lon_m, lon_s = coordinate_to_dms(lon)

    if representation_type == "DMS":
        p = PositionRepresentation(
            latitude=f"{lat_d:02}° {lat_m:02}' {lat_s:02}'' {north_south}",
            longitude=f"{lon_d:03}° {lon_m:02}' {lon_s:02}'' {east_west}",
        )

    elif representation_type == "DMD":
        p = PositionRepresentation(
            latitude=f"{lat_d:02}° {lat_md:06.3f}' {north_south}",
            longitude=f"{lon_d:03}° {lon_md:06.3f}' {east_west}",
        )

    else:
        raise ValueError(
            (
                "Unexpected `representation_type`. "
                f"Expected 'DMS' or 'DMD', got {representation_type} instead."
            )
        )

    return p


def to_multipolygon(p: Union[Polygon, MultiPolygon]) -> MultiPolygon:
    """
    Returns a MultiPolygon of the input Polygon or MultiPolygon geometry.
    """

    if isinstance(p, Polygon):
        res = MultiPolygon([p])
    elif isinstance(p, MultiPolygon):
        res = p
    else:
        raise ValueError("Input must be shapely Polygon or MultiPolygon")

    return res


def estimate_current_position(
    last_latitude: float,
    last_longitude: float,
    course: float,
    speed: float,
    hours_since_last_position: float,
    max_hours_since_last_position: float = 2.0,
    on_error: str = "ignore",
) -> Tuple[float, float]:
    """
    Estimate the current position of a vessel based on its last position, course and
    speed. If the last position is older than max_hours_since_last_position, or is in
    the future (i.e. hours_since_last_position is negative), returns None.

    Args:
        last_latitude (float): last known latitude of vessel
        last_longitude (float): last known longitude of vessel
        course (float): last known route of vessel in degrees
        speed (float): last known speed of vessel in nots
        hours_since_last_position (float): time since last known position of vessel, in
          hours
        max_hours_since_last_position (float): maximum time in hours since last
          position, after which the estimation is not performed (returns None instead)
          Defaults to 2.0
        on_error (str): 'ignore' or 'raise'

    Returns:
        float: estimated current latitude
        float: estimated current longitude
    """
    if not 0 <= hours_since_last_position <= max_hours_since_last_position:
        lat, lon = None, None
    else:
        geod = Geod(ellps="WGS84")
        try:
            distance = speed * hours_since_last_position * 1852
            lon, lat, _ = geod.fwd(last_longitude, last_latitude, course, distance)
        except:
            if on_error == "ignore":
                lat, lon = None, None
            elif on_error == "raise":
                raise
            else:
                raise ValueError(
                    f"on_error argument must be 'ignore' or 'raise', got {on_error}."
                )
    return lat, lon


def get_h3_indices(
    df: pd.DataFrame,
    lat: str = "latitude",
    lon: str = "longitude",
    resolution: int = 12,
) -> pd.Series:
    """
    Returns a Series with the same index as the input DataFrame and values equal to the
    h3 index corresponding to the latitude and longitude of the indicated columns of
    the DataFrame

    Args:
        df (pd.DataFrame): DataFrame with latitude and longitude coordinates in 2 of
          its columns
        lat (str): name of the column containing latitudes. Defaults to "latitude".
        lon (str): name of the column containing longitudes. Defaults to "longitude".
        resolution (int): h3 resolution of the h3 cells to output.

    Returns:
        pd.Series: h3 cells indices
    """

    if len(df) == 0:
        res = pd.Series([], dtype=object)
    else:
        res = df.apply(
            lambda row: h3.geo_to_h3(row["latitude"], row["longitude"], resolution),
            axis=1,
        )

    return res


def get_k_ring_of_h3_cells(h3_sequence: Iterable[str], k: int) -> Set[str]:
    """
    Takes an list-like sequence of h3 cells and an integer k, returns the set of h3
    cells that belong to the k-ring of at least one of the h3 cells in the input
    sequence.

    Args:
        h3_sequence (sequence): sequence of h3 cells
        k (int): number of rings to add around the input cells

    Returns:
        sequence[str]: sequence of h3 cells belonging to the k-ring of at least one of
        the h3 cells in the input sequence
    """
    h3_cells = [h3.k_ring(h, k) for h in h3_sequence]
    return set.union(*h3_cells)


def point_dist(position1: Position, position2: Position) -> float:
    """
    Computes the spherical distance between two Position objects in meters.

    Args:
        position1 (Position)
        position2 (Position)

    Returns:
        float: distance in meters between the two input Positions
    """

    d = h3.point_dist(
        (position1.latitude, position1.longitude),
        (position2.latitude, position2.longitude),
        unit="m",
    )

    return d


def get_step_distances(
    df: pd.DataFrame,
    lat: str = "latitude",
    lon: str = "longitude",
    how: str = "backward",
    unit: str = "m",
) -> np.array:
    """Compute the distance between successive positions (rows). The DataFrame must
    have latitude and longitude columns.
    Returns a numpy array with the same length as the input DataFrame and distances as
    values.

    Args:
        df
        lat (str): column name containing latitudes
        lon (str): column name containing longitudes
        how (str): if, 'forward', computes the interval between each position and the
          next one. if 'backward', computes the interval between each position and
          the previous one.
        unit (str): the distance unit (passed to h3.point_dist). Defaults to 'm'.

    Returns:
        np.array: array of distances between the successive positions.
    """

    if len(df) < 2:
        distances = [np.nan] * len(df)
    else:

        # For some reason, this is 100x faster than df[[lat, lon]].values
        lat_lon = np.concatenate(
            (df[lat].values[:, None], df[lon].values[:, None]), axis=1
        )

        strides = np.lib.stride_tricks.sliding_window_view(
            lat_lon,
            window_shape=(2, 2),
        ).reshape((len(df) - 1, 4))

        # Using a list comprehension is 5x faster than using np.apply_over_axis here
        distances = np.array(
            [
                h3.point_dist((lat1, lon1), (lat2, lon2), unit=unit)
                for lat1, lon1, lat2, lon2 in strides
            ]
        )

        if how == "forward":
            distances = np.append(distances, [np.nan])
        elif how == "backward":
            distances = np.append([np.nan], distances)
        else:
            raise ValueError(f"how must be 'forward' or 'backward', got f{how}")

    res = np.array(distances)

    return res


def compute_movement_metrics(
    positions: pd.DataFrame,
    lat: str = "latitude",
    lon: str = "longitude",
    datetime_column: str = "datetime_utc",
    is_at_port_column: str = "is_at_port",
    time_emitting_at_sea_column: str = "time_emitting_at_sea",
) -> pd.DataFrame:
    """Takes a pandas DataFrame with:

        - latitude and longitude columns (float dtypes)
        - a column indicating the date and time of the position (datetime dtype)
        - a column indicating whether the vessel is at port (boolean dtype)
        - a column indicating how long the vessel has been continuously
          emitting at sea (timedelta dtype)

    whose rows represent successive positions of a vessel, assumed to be sorted
    chronologically by ascending order.

    Returns pandas DataFrame with the same index and columns, with :

      - speed, distance and time between successive positions as additionnal computed
        features in new columns
      - values for `time_emitting_at_sea_column` computed and updated - so if the input
        contained any NULL values, they will be computed and filled in.

    Args:
        positions (pd.DataFrame): DataFrame representing a vessel route
        lat (str) : column name of latitude values. May not contain null values.
        lon (str) : column name of longitude values. May not contain null values.
        datetime_column (str) : column name of datetime values. May not contain null
          values.
        is_at_port_column (str) : column indicating whether the vessel is at port. May
          not contain null values.
        time_emitting_at_sea_column (timedelta) : column indicating how long the vessel
          has been continuously emitting at sea. May contain null values.

    Returns:
        pd.DataFrame: the same DataFrame, plus added columns with the computed features
    """
    # TODO: add `maximum_time_between_positions` argument, above which metrics should
    # not be computed - computing the average speed between positions emitted more than
    # a few hours apart does not make much sense.

    positions = positions.copy(deep=True)

    # Compute meters_from_previous_position
    meters_from_previous_position = get_step_distances(
        positions, lat=lat, lon=lon, how="backward", unit="m"
    )

    positions["meters_from_previous_position"] = meters_from_previous_position

    # Compute time_since_previous_position
    time_since_previous_position = get_datetime_intervals(
        positions[datetime_column], how="backward"
    )

    positions["time_since_previous_position"] = time_since_previous_position

    # Compute average speed
    seconds_since_previous_position = (
        time_since_previous_position.map(lambda dt: dt.total_seconds())
    ).values

    average_speed = (
        meters_from_previous_position / 1852 / (seconds_since_previous_position / 3600)
    )

    positions["average_speed"] = average_speed

    # Compute time_emitting_at_sea
    if len(time_since_previous_position) > 0:

        #      time|
        # intervals|                                   _____ : cumsum of all time
        #   between|                vessel at sea     |        intervals between
        # positions|                <----------->     |        sucessive positions
        #          |                             _____|
        #          |                            |
        #          |                        ____|
        #          |                 ______|    .
        #          |                |           .
        #          |             ___|           .
        #          |         ___|   .       ____._________ : A: cumsum of time
        #          |        |       .______|    |            intervals at sea only
        #          |   _____|       |           |
        #          |__|_____________|           |_________ : res = A - cummax(
        #                                                                 A*is_at_port)
        #          -----------------*-----------*------------------------------------->
        #          pos1    pos2     port        port                         successive
        #                           exit        entry                        positions
        #
        # To compute the cumulative time of uninterrupted emission at sea, we compute
        # the cumulative sum of time intervals between successive positions at sea (A)
        # and then subtract A * is_port_entry to bring the number back to zero at each
        # port entry.

        is_at_port = positions[is_at_port_column].values
        was_previously_at_port = np.insert(is_at_port[:-1], 0, False)
        is_at_port_or_just_left_port = is_at_port | was_previously_at_port

        t0 = positions[time_emitting_at_sea_column].values[0]
        t0 = timedelta(minutes=0) if np.isnat(t0) else t0

        time_emitting_at_sea_intervals = time_since_previous_position.values
        np.put(time_emitting_at_sea_intervals, 0, t0)
        time_emitting_at_sea_intervals = time_emitting_at_sea_intervals * (
            ~is_at_port_or_just_left_port
        )
        time_emitting_at_sea = np.cumsum(time_emitting_at_sea_intervals)

        time_emitting_at_sea = time_emitting_at_sea - np.maximum.accumulate(
            time_emitting_at_sea * is_at_port
        )
        positions[time_emitting_at_sea_column] = time_emitting_at_sea

    return positions


def detect_fishing_activity(
    positions: pd.DataFrame,
    minimum_time_of_emission_at_sea: np.timedelta64,
    is_at_port_column: str = "is_at_port",
    average_speed_column: str = "average_speed",
    time_emitting_at_sea_column: str = "time_emitting_at_sea",
    minimum_consecutive_positions: int = 3,
    min_fishing_speed_threshold: float = 0.1,
    max_fishing_speed_threshold: float = 4.5,
    return_floats: bool = False,
) -> pd.DataFrame:
    """
    Detects fishing activity from positions of a vessel.

    Rows of the input DataFrame represent successive positions of the analyzed vessel,
    assumed to be sorted chronologically by ascending order.

    The DataFrame must have a columns indicating :

      1) whether the position is at port
      2) the average speed between each position and the previous one, in knots

    A vessel will be considered to be fishing if its average speed remains above the
    `min_fishing_speed_threshold` and below the `max_fishing_speed_threshold` for a
    minimum of `minimum_consecutive_positions` positions outside a port and after at
    least `minimum_time_of_emission_at_sea` time of uninterrupted VMS emission outside
    of a port.

    Args:
        positions (pd.DataFrame) : DataFrame representing successive positions of a
          vessel, assumed to be sorted by ascending datetime
        minimum_time_of_emission_at_sea (np.timedelta64): the minimum time a vessel is
          required to emit continuously at sea in order to be considred as in fishing
          activity. This avoids detecting fishing activity when vessels leave ports.
        is_at_port_column (str) : name of the column containing boolean values for
          whether a position is in at port or not
        average_speed_column (str) : name of the column containing average speed values
          (distance from previous position divided by time since the last position), in
          knots
        time_emitting_at_sea_column (str): name of the column containing the duration
          for which the vessel has been continuously emitting at sea (outside ports)
        minimum_consecutive_positions (int): minimum number of consecutive positions
          below fishing speed threshold to consider that a vessel is fishing
        min_fishing_speed_threshold (float): speed below which a vessel is considered
          to be stopped
        max_fishing_speed_threshold (float): speed above which a vessel is considered
          to be in transit
        return_floats (bool): if `True`, return `float` dtypes with 1.0 representing
          `True`, 0.0 representing `False` and `np.nan` for null values. If `False`
          (the default), the return dtype is `object` and values are `True`, `False`
          and `np.nan`, which is more explicit and natural but slower.


    Returns:
        pd.DataFrame: copy of the input DataFrame with the added boolean column
        "is_fishing"
    """

    positions = positions.copy(deep=True)

    if len(positions) == 0:
        positions["is_fishing"] = None

    else:
        is_at_port = positions[is_at_port_column].values
        average_speed = positions[average_speed_column].values
        time_emitting_at_sea = positions[time_emitting_at_sea_column].values

        # The average speed may contain null values, in particular the first position
        # of a series of positions, for which the time and distance from the previous
        # positions is not known. In this case we must test whether the outcome of the
        # evaluation of whether positions are in fishing activity depend on these
        # unknown speeds :
        #
        #   - positions that are evaluated as being in fishing activity regardless of
        #     whether the unknown speeds are below or above the fishing speed threshold
        #     can be asserted to be in fishing activity
        #
        #   - positions that are evaluated as NOT being in fishing activity regardless
        #     of whether the unknown speeds are below or above the fishing speed
        #     threshold can be asserted to NOT be in fishing activity
        #
        #   - positions for which the evaluation of whether they correspond to a
        #     fishing activity depends on the unknown speeds cannot be decided and
        #     should therefore evaluate to `None`.

        is_at_fishing_speed = (average_speed >= min_fishing_speed_threshold) * (
            average_speed <= max_fishing_speed_threshold
        )

        is_at_fishing_speed_unknown_is_true = np.where(
            np.isnan(average_speed), True, is_at_fishing_speed
        )

        is_at_fishing_speed_unknown_is_false = np.where(
            np.isnan(average_speed), False, is_at_fishing_speed
        )

        arr_unknown_speed_is_fishing_speed = np.concatenate(
            (is_at_port[:, None], is_at_fishing_speed_unknown_is_true[:, None]), axis=1
        )

        arr_unknown_speed_is_not_fishing_speed = np.concatenate(
            (is_at_port[:, None], is_at_fishing_speed_unknown_is_false[:, None]), axis=1
        )

        fishing_activity_unknown_speed_is_fishing_speed = rows_belong_to_sequence(
            arr_unknown_speed_is_fishing_speed,
            np.array([False, True]),
            window_length=minimum_consecutive_positions,
        )

        fishing_activity_unknown_speed_is_not_fishing_speed = rows_belong_to_sequence(
            arr_unknown_speed_is_not_fishing_speed,
            np.array([False, True]),
            window_length=minimum_consecutive_positions,
        )

        fishing_activity = np.where(
            (
                fishing_activity_unknown_speed_is_fishing_speed
                == fishing_activity_unknown_speed_is_not_fishing_speed
            ),
            fishing_activity_unknown_speed_is_fishing_speed,
            np.nan,
        )

        fishing_activity = np.where(
            time_emitting_at_sea > minimum_time_of_emission_at_sea,
            fishing_activity,
            False,
        )

        positions["is_fishing"] = fishing_activity

        if not return_floats:
            positions["is_fishing"] = zeros_ones_to_bools(positions["is_fishing"])

    return positions


def enrich_positions(
    positions: pd.DataFrame,
    minimum_time_of_emission_at_sea: np.timedelta64,
    lat: str = "latitude",
    lon: str = "longitude",
    datetime_column: str = "datetime_utc",
    is_at_port_column: str = "is_at_port",
    time_emitting_at_sea_column: str = "time_emitting_at_sea",
    minimum_consecutive_positions: int = 3,
    min_fishing_speed_threshold: float = 0.1,
    max_fishing_speed_threshold: float = 4.5,
    return_floats: bool = False,
) -> pd.DataFrame:
    """
    Applies `compute_movement_metrics` and `detect_fishing_activity` successively.

    See these two functions for help.
    """

    positions = compute_movement_metrics(
        positions,
        lat=lat,
        lon=lon,
        datetime_column=datetime_column,
        is_at_port_column=is_at_port_column,
        time_emitting_at_sea_column=time_emitting_at_sea_column,
    )

    positions = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=minimum_time_of_emission_at_sea,
        is_at_port_column=is_at_port_column,
        average_speed_column="average_speed",
        time_emitting_at_sea_column=time_emitting_at_sea_column,
        minimum_consecutive_positions=minimum_consecutive_positions,
        min_fishing_speed_threshold=min_fishing_speed_threshold,
        max_fishing_speed_threshold=max_fishing_speed_threshold,
        return_floats=return_floats,
    )

    return positions


def geocode(
    query_string=None, country_code_iso2=None, backend: str = "Nominatim", **kwargs
):
    """
    Return latitude, longitude for input location from a query string or from one or
    more of the following keyword arguments:

      - street
      - city
      - county
      - state
      - country
      - postalcode

    """

    if backend == "Nominatim":
        base_url = "https://nominatim.openstreetmap.org/search"
        params = {"format": "json"}
    elif backend == "LocationIQ":
        assert LOCATIONIQ_TOKEN
        base_url = "https://eu1.locationiq.com/v1/search.php"
        params = {"key": LOCATIONIQ_TOKEN, "format": "json"}
    else:
        raise ValueError(
            f"backend param expects 'Nominatim' or 'LocatinIQ', received '{backend}'."
        )

    if query_string is not None and not pd.isna(query_string):
        if kwargs:
            print(
                "Keyword arguments cannot be used in combination with text query. "
                + "Keyword arguments will be ignored."
            )

        params["q"] = query_string

    elif kwargs:
        params = {**params, **kwargs}

    else:
        print(
            "You must provide either a query string or at least 1 of the allowed "
            + "keyword arguments."
        )
        return None, None

    if country_code_iso2:
        params["countrycodes"] = str(country_code_iso2)

    response = requests.get(base_url, params=params)

    try:
        response.raise_for_status()

        # When the location cannot be geocoded, LocationIQ returns a 404, whereas
        # Nominatim returns a 200 with an empty responsen, so an additionnal check
        # is required to cover this case
        data = response.json()
        assert len(data) > 0
    except (requests.HTTPError, AssertionError):
        raise ValueError(f"Could not geocode {params}")
    data = response.json()[0]
    return float(data["lat"]), float(data["lon"])


def geocode_google(address=None, **kwargs):
    """
    Return latitude, longitude for input location from a query string, with optionnal
    filtering on one or more of the following keyword arguments:

      - postal_code
      - country (country name or country code ISO2)
      - route
      - locality
      - administrative_area

    If address is not given, at least one kwarg must be given.

    """

    assert GOOGLE_API_TOKEN

    base_url = "https://maps.googleapis.com/maps/api/geocode/json?"

    try:
        assert address or kwargs
    except AssertionError:
        raise ValueError("No arguments given.")

    params = dict()

    if address:
        # params += f"address={quote(address)}"
        params["address"] = address

    if kwargs:
        components = "|".join([f"{k}:{quote(v)}" for k, v in kwargs.items()])
        params["components"] = components
        # params += f"components={components}"

    # params += f"key={GOOGLE_API_TOKEN}"
    params["key"] = GOOGLE_API_TOKEN

    response = requests.get(base_url, params=params)

    try:
        response.raise_for_status()
        data = response.json()
        status = data["status"]
        assert status == "OK"
    except AssertionError:
        print(f"Could not geocode {address} {components}. Status {status}.")
        if "error_message" in data:
            print(data["error_message"])
        raise
    except requests.HTTPError:
        print(f"HTTPError with {address} {components}")
        raise
    location = data["results"][0]["geometry"]["location"]
    return float(location["lat"]), float(location["lng"])
