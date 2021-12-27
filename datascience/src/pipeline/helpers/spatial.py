from dataclasses import dataclass
from typing import Iterable, Set, Tuple, Union

import h3
import numpy as np
import pandas as pd
from pyproj import Geod
from shapely.geometry import MultiPolygon, Polygon

from src.pipeline.helpers.dates import get_datetime_intervals
from src.pipeline.processing import rows_belong_to_sequence, zeros_ones_to_bools


@dataclass
class Position:
    latitude: float
    longitude: float


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
    """Estimate the current position of a vessel based on its last position, course and
    speed. If the last position is older than max_hours_since_last_position, or is in
    the future (i.e. hours_since_last_position is negative), returns None.

    Args:
        last_latitude (float): last known latitude of vessel
        last_longitude (float): last known longitude of vessel
        course (float): last known route of vessel in degrees
        speed (float): last known speed of vessel in nots
        hours_since_last_position (float): time since last known position of vessel, in hours
        max_hours_since_last_position (float): maximum time in hours since last position,
            after which the estimation is not performed (returns None instead).
            Defaults to 2.0.
        on_error (str): 'ignore' or 'raise'.

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
    Computes the spherical distance between two Position objects in
    meters.

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
        unit (str): the distance unit (passed to h3.point_dist).
            Defaults to 'm'.

    Returns:
        np.array: array of distances between the successive positions.
    """

    if len(df) < 2:
        distances = [np.nan] * len(df)
    else:

        strides = np.lib.stride_tricks.sliding_window_view(
            df[[lat, lon]].values,
            window_shape=(2, 2),
        ).reshape((len(df) - 1, 4))

        distances = np.apply_along_axis(
            lambda x: h3.point_dist(tuple(x[[0, 1]]), tuple(x[[2, 3]]), unit=unit),
            axis=1,
            arr=strides,
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
    datetime_col: str = "datetime_utc",
) -> pd.DataFrame:
    """Takes a pandas DataFrame with
        - latitude, longitude columns (float dtypes)
        - a datetime column
    whose rows represent successive positions of a vessel, assumed to be sorted
    chronologically by ascending order.

    Returns pandas DataFrame with the same index and columns, plus addtionnal computed
    features in new columns : speed, distance and time between successive positions.

    Args:
        positions (pd.DataFrame): DataFrame representing a vessel route
        lat (str) : column name of latitude values
        lon (str) : column name of longitude values
        datetime_col (str): column name of datetime values

    Returns:
        pd.DataFrame: the same DataFrame, plus added columns with the computed features
    """
    # TODO: add `maximum_time_between_positions` argument, above which metrics should
    # not be computed - computing the average speed between positions emitted more than
    # a few hours apart does not make much sense.

    positions = positions.copy(deep=True)

    positions["meters_from_previous_position"] = get_step_distances(
        positions, lat=lat, lon=lon, how="backward", unit="m"
    )

    positions["time_since_previous_position"] = get_datetime_intervals(
        positions[datetime_col], how="backward"
    )

    positions["average_speed"] = (
        positions["meters_from_previous_position"].values
        / 1852
        / (
            (
                positions["time_since_previous_position"].map(
                    lambda dt: dt.total_seconds()
                )
            ).values
            / 3600
        )
    )

    return positions


def detect_fishing_activity(
    positions: pd.DataFrame,
    is_at_port_column: str = "is_at_port",
    average_speed_column: str = "average_speed",
    minimum_consecutive_positions: int = 3,
    fishing_speed_threshold: float = 4.5,
) -> pd.DataFrame:
    """
    Detects fishing activity from positions of a vessel.

    Rows of the input DataFrame represent successive positions of the analyzed vessel,
    assumed to be sorted chronologically by ascending order.

    The DataFrame must have a columns indicating
        1) whether the position is at port
        2) the average speed between each position and the previous one, in knots

    A vessel will be considered to be fishing if its speed remains below the
    `fishing_speed_threshold` for a minimum of `minimum_consecutive_positions`
    positions.

    Args:
        positions (pd.DataFrame) : DataFrame representing successive positions of a
          vessel, assumed to be sorted by ascending datetime
        is_at_port_column (str) : name of the column containing boolean values for
          whether a position is in at port or not
        average_speed_column (str) : name of the column containing average speed values
          (distance from previous position divided by time since the last position), in
          knots
        minimum_consecutive_positions (int): minimum number of consecutive positions
          below fishing speed threshold to consider that a vessel is fishing
        fishing_speed_threshold (float): speed below which a vessel is considered to be
          fishing

    Returns:
        pd.DataFrame: copy of the input DataFrame with the added boolean column
          "is_fishing"
    """

    positions = positions.copy(deep=True)

    is_at_port = positions[is_at_port_column].values
    average_speed = positions[average_speed_column].values
    is_at_fishing_speed = average_speed < fishing_speed_threshold

    arr = np.concatenate((is_at_port[:, None], is_at_fishing_speed[:, None]), axis=1)

    fishing_activity = rows_belong_to_sequence(
        arr,
        np.array([False, True]),
        window_length=minimum_consecutive_positions,
    )

    fishing_activity = np.where(
        np.isnan(average_speed) & ~is_at_port, np.nan, fishing_activity
    )

    positions["is_fishing"] = fishing_activity
    positions["is_fishing"] = zeros_ones_to_bools(positions["is_fishing"])
    return positions


def enrich_positions(
    positions: pd.DataFrame,
    lat: str = "latitude",
    lon: str = "longitude",
    datetime_col: str = "datetime_utc",
    is_at_port_column: str = "is_at_port",
    minimum_consecutive_positions: int = 3,
    fishing_speed_threshold: float = 4.5,
) -> pd.DataFrame:
    """
    Applies `compute_movement_metrics` and `detect_fishing_activity` successively.

    See these two functions for help.
    """

    positions = compute_movement_metrics(
        positions,
        lat=lat,
        lon=lon,
        datetime_col=datetime_col,
    )

    positions = detect_fishing_activity(
        positions,
        is_at_port_column=is_at_port_column,
        average_speed_column="average_speed",
        minimum_consecutive_positions=minimum_consecutive_positions,
        fishing_speed_threshold=fishing_speed_threshold,
    )

    return positions
