import pandas as pd
from prefect import task

from config import ANCHORAGES_H3_CELL_RESOLUTION
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.spatial import get_h3_indices
from src.pipeline.processing import get_first_non_null_column_name


@task(checkpoint=False)
def tag_positions_at_port(positions: pd.DataFrame) -> pd.DataFrame:
    """
    Adds an `is_at_port` boolean field to a DataFrame containing positions.

    Mandatory fields `latitude` and `longitude` are converted to h3 indices and compared
    to a referential of h3 indices of ports and anchor areas. If the h3 index of the
    latitude-longitude position matches that of a port or anchor area, then `is_at_port`
    will be `True`.

    Additionnally, if a `is_on_land` boolean column is present in the input DataFrame,
    positions with `is_on_land` = True will have `is_at_port` = True regardless of the
    latitude-longitude position. The `is_on_land` column is dropped after being taken
    into account for the computation of `is_at_port`.

    Args:
        positions: DataFrame with at least 'latitude' and 'longitude' columns and
          an optionnal `is_on_land` column.

    Returns:
        pd.DataFrame: same as input with an added 'is_at_port' boolean field.
    """

    positions = positions.copy(deep=True)

    if len(positions) == 0:
        positions["is_at_port"] = False

    else:
        positions["h3"] = get_h3_indices(
            positions,
            lat="latitude",
            lon="longitude",
            resolution=ANCHORAGES_H3_CELL_RESOLUTION,
        )

        h3_indices_at_port = set(
            extract(
                db_name="monitorfish_remote",
                query_filepath="monitorfish/h3_is_anchorage.sql",
                params={"h3_cells": tuple(positions.h3)},
            )["h3"]
        )

        positions["is_at_port"] = positions.h3.isin(h3_indices_at_port)

        positions = positions.drop(columns=["h3"])

        if "is_on_land" in positions:
            positions["is_at_port"] = positions[["is_at_port", "is_on_land"]].any(
                axis=1
            )
            positions = positions.drop(columns=["is_on_land"])

    return positions


@task(checkpoint=False)
def add_vessel_identifier(positions: pd.DataFrame) -> pd.DataFrame:
    vessel_identifier_labels = {
        "cfr": "INTERNAL_REFERENCE_NUMBER",
        "ircs": "IRCS",
        "external_immatriculation": "EXTERNAL_REFERENCE_NUMBER",
    }

    positions = positions.copy(deep=True)

    positions["vessel_identifier"] = get_first_non_null_column_name(
        positions[["cfr", "ircs", "external_immatriculation"]],
        vessel_identifier_labels,
    )

    return positions
