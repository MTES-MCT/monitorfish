from datetime import datetime
from typing import Tuple

import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.tasks.control_flow import merge

from config import CURRENT_POSITION_ESTIMATION_MAX_HOURS, default_risk_factors
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.spatial import estimate_current_position
from src.pipeline.processing import (
    coalesce,
    drop_duplicates_by_decreasing_priority,
    join_on_multiple_keys,
    left_isin_right_by_decreasing_priority,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.positions import (
    add_vessel_identifier,
    tag_positions_at_port,
)


@task(checkpoint=False)
def validate_action(action: str) -> str:
    """
    Checks that the received parameter value is valid and returns it. Raises ValueError
    otherwise.

    Args:
        action (str): input parameter for the flow

    Returns:
        str: input, if valid

    Raises:
        ValueError: if input in not valid
    """

    valid_actions = {"update", "replace"}

    if action in valid_actions:
        return action
    else:
        raise ValueError(
            f"action must be one of {', '.join(valid_actions)}, got {action}"
        )


@task(checkpoint=False)
def extract_last_positions(minutes: int) -> pd.DataFrame:
    """
    Extracts the last position of each vessel over the past `minutes` minutes.

    Args:
        minutes (int): number of minutes from current datetime to extract

    Returns:
        pd.DataFrame: DataFrame of vessels' last position.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/compute_last_positions.sql",
        params={"minutes": minutes},
        dtypes={"last_position_datetime_utc": "datetime64[ns]"},
    )


@task(checkpoint=False)
def extract_pending_alerts() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pending_alerts.sql",
    )


@task(checkpoint=False)
def drop_duplicates(positions: pd.DataFrame) -> pd.DataFrame:
    """
    Drop duplicate vessels in a `pandas.DataFrame` of positions.

    This is required although the query that computes last positions already contains a
    DISTINCT ON clause because for some vessels, we receive each position twice with
    partially different identifiers - for instance, the same CFR but different ircs or
    external immatriculation.

    Args:
        positions (pd.DataFrame): positions of vessels. Must contain columns "cfr",
          "external_immatriculation" and "ircs".

    Returns:
        pd.DataFrame: DataFrame of vessels' last position with duplicates removed.
    """
    return drop_duplicates_by_decreasing_priority(
        positions, subset=["cfr", "external_immatriculation", "ircs"]
    )


@task(checkpoint=False)
def extract_previous_last_positions() -> pd.DataFrame:
    """
    Extracts the contents of the `last_positions` table (which was computed by the
    previous run of the `last_positions` flow), with the `has_charter` field updated
    by taking the current value in the `vessels` table.

    Returns:
        pd.DataFrame: DataFrame of vessels' last position as (it was last computed by
          the last_positions flow).
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/previous_last_positions.sql",
    )


@task(checkpoint=False)
def drop_unchanched_new_last_positions(
    new_last_positions: pd.DataFrame, previous_last_positions: pd.DataFrame
) -> pd.DataFrame:
    """
    Filters all positions of new_last_positions that are present in
    previous_last_positions.

    Args:
        previous_last_positions (pd.DataFrame)
        new_last_positions (pd.DataFrame)

    Returns:
        pd.DataFrame: subset of new_last_positions
    """
    return new_last_positions[
        ~new_last_positions.id.isin(set(previous_last_positions.id))
    ].copy(deep=True)


@task(checkpoint=False)
def split(
    previous_last_positions: pd.DataFrame, new_last_positions: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits vessels into 3 categories:

    - The ones that are in previous_last_positions only (known vessels that haven't
      moved)
    - The ones that are in new_last_positions only (new vessels never seen before)
    - The ones in both datasets (known vessels that have moved and whose position must
      be updated)

    Returns the last_positions data of these 3 sets of vessels separately in 3
    DataFrames. For vessels whose position must be updated, the returned DataFrame
    contains the data of both the previous and the new last_position, in order to make
    it possible to computed some metrics (i.e. the emission period).

    Args:
        previous_last_positions (pd.DataFrame)
        new_last_positions (pd.DataFrame)

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
          - unchanged_previous_last_positions
          - new_vessels_last_positions
          - last_positions_to_update
    """

    previous_last_positions = previous_last_positions.copy(deep=True)
    new_last_positions = new_last_positions.copy(deep=True)

    vessel_id_cols = ["cfr", "external_immatriculation", "ircs"]

    unchanged_previous_last_positions = previous_last_positions[
        ~left_isin_right_by_decreasing_priority(
            previous_last_positions[vessel_id_cols], new_last_positions[vessel_id_cols]
        )
    ]

    new_vessels_last_positions = new_last_positions[
        ~left_isin_right_by_decreasing_priority(
            new_last_positions[vessel_id_cols], previous_last_positions[vessel_id_cols]
        )
    ]

    last_positions_to_update = join_on_multiple_keys(
        (
            previous_last_positions[
                vessel_id_cols + ["last_position_datetime_utc"]
            ].rename(
                columns={
                    "last_position_datetime_utc": "last_position_datetime_utc_previous"
                }
            )
        ),
        (
            new_last_positions.rename(
                columns={"last_position_datetime_utc": "last_position_datetime_utc_new"}
            )
        ),
        on=vessel_id_cols,
        how="inner",
    )

    return (
        unchanged_previous_last_positions,
        new_vessels_last_positions,
        last_positions_to_update,
    )


@task(checkpoint=False)
def compute_emission_period(last_positions_to_update: pd.DataFrame) -> pd.DataFrame:
    """
    Computes the emission period of the last_positions that require an update.

    If an emission period is already present (which might happen if there are more
    than one position per vessel in the requested time period of the last_position
    query), this emission period is used. Otherwise, the emission period is taken to
    be equal to the time between the previous last_position_datetime_utc and the new
    last_position_datetime_utc.

    Args:
        last_positions_to_update (pd.DataFrame): last_positions data for vessels that
          have moved

    Returns:
        pd.DataFrame: updated last_positions with computed emission period field

    """

    updated_last_positions = last_positions_to_update.copy(deep=True)

    updated_last_positions["new_to_previous_time_interval"] = (
        updated_last_positions.last_position_datetime_utc_new
        - updated_last_positions.last_position_datetime_utc_previous
    )

    updated_last_positions.loc[:, "emission_period"] = coalesce(
        updated_last_positions[["emission_period", "new_to_previous_time_interval"]]
    )

    updated_last_positions = updated_last_positions.drop(
        columns=["new_to_previous_time_interval", "last_position_datetime_utc_previous"]
    ).rename(columns={"last_position_datetime_utc_new": "last_position_datetime_utc"})

    return updated_last_positions


@task(checkpoint=False)
def concatenate(
    unchanged_previous_last_positions: pd.DataFrame,
    new_vessels_last_positions: pd.DataFrame,
    updated_last_positions: pd.DataFrame,
) -> pd.DataFrame:
    """
    Concatenates the 3 sets of last_positions and reindexes the rows from 1 to n.

    Args:
        unchanged_previous_last_positions (pd.DataFrame)
        new_vessels_last_positions (pd.DataFrame)
        updated_last_positions (pd.DataFrame)

    Returns:
        pd.DataFrame: concatenation of the 3 inputs sets of last_positions
    """

    last_positions = (
        pd.concat(
            [
                unchanged_previous_last_positions,
                new_vessels_last_positions,
                updated_last_positions,
            ]
        )
        .reset_index()
        .drop(columns=["index"])
    )

    return last_positions


@task(checkpoint=False)
def extract_risk_factors():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/risk_factors.sql",
    )


@task(checkpoint=False)
def estimate_current_positions(
    last_positions: pd.DataFrame, max_hours_since_last_position: float
) -> pd.DataFrame:
    """

    Args:
        last_positions (pd.DataFrame): vessels' last position with route and speed
          data.
      max_hours_since_last_position (float): maximum time in hours since the last
        position above which the current position will not be extrapolated.

    Returns:
        pd.DataFrame: vessels' last position with added estimated_current_latitude and
          estimated_current_longitude fields

    """

    last_positions = last_positions.copy(deep=True)
    now = datetime.utcnow()

    estimated_position_cols = [
        "estimated_current_latitude",
        "estimated_current_longitude",
    ]

    last_positions[estimated_position_cols] = last_positions.apply(
        lambda row: estimate_current_position(
            last_latitude=row["latitude"],
            last_longitude=row["longitude"],
            course=row["course"],
            speed=row["speed"],
            hours_since_last_position=(
                (now - row["last_position_datetime_utc"]).total_seconds() / 3600
            ),
            max_hours_since_last_position=max_hours_since_last_position,
            on_error="ignore",
        ),
        axis=1,
        result_type="expand",
    )

    return last_positions


@task(checkpoint=False)
def merge_last_positions_risk_factors_alerts(
    last_positions: pd.DataFrame,
    risk_factors: pd.DataFrame,
    pending_alerts: pd.DataFrame,
) -> pd.DataFrame:
    """
    Performs a left join on last_positions, risk_factors and pending_alerts using cfr,
    ircs and external_immatriculation as join keys.
    """
    last_positions = join_on_multiple_keys(
        last_positions,
        risk_factors,
        on=["cfr", "ircs", "external_immatriculation"],
        how="left",
    )

    last_positions = join_on_multiple_keys(
        last_positions,
        pending_alerts,
        on=["cfr", "ircs", "external_immatriculation"],
        how="left",
    )

    last_positions = last_positions.fillna(
        {**default_risk_factors, "total_weight_onboard": 0.0}
    )
    return last_positions


@task(checkpoint=False)
def load_last_positions(last_positions):

    load(
        last_positions,
        table_name="last_positions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=["segments", "alerts"],
        handle_array_conversion_errors=True,
        value_on_array_conversion_error="{}",
        jsonb_columns=["gear_onboard", "species_onboard"],
        nullable_integer_columns=["trip_number"],
        timedelta_columns=["emission_period"],
    )


with Flow("Last positions") as flow:

    # Only run if the previous run has finished running
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Parameters
        current_position_estimation_max_hours = Parameter(
            "current_position_estimation_max_hours",
            default=CURRENT_POSITION_ESTIMATION_MAX_HOURS,
        )
        minutes = Parameter("minutes", default=5)
        action = Parameter("action", default="update")
        action = validate_action(action)

        # Extract & Transform
        risk_factors = extract_risk_factors()
        pending_alerts = extract_pending_alerts()

        last_positions = extract_last_positions(minutes=minutes)
        last_positions = drop_duplicates(last_positions)
        last_positions = add_vessel_identifier(last_positions)
        last_positions = tag_positions_at_port(last_positions)

        with case(action, "update"):
            previous_last_positions = extract_previous_last_positions()
            previous_last_positions = drop_duplicates(previous_last_positions)
            new_last_positions = drop_unchanched_new_last_positions(
                last_positions, previous_last_positions
            )

            (
                unchanged_previous_last_positions,
                new_vessels_last_positions,
                last_positions_to_update,
            ) = split(previous_last_positions, new_last_positions)
            updated_last_positions = compute_emission_period(last_positions_to_update)

            last_positions_1 = concatenate(
                unchanged_previous_last_positions,
                new_vessels_last_positions,
                updated_last_positions,
            )

        with case(action, "replace"):
            last_positions_2 = last_positions

        last_positions = merge(last_positions_1, last_positions_2, checkpoint=False)

        last_positions = estimate_current_positions(
            last_positions=last_positions,
            max_hours_since_last_position=current_position_estimation_max_hours,
        )
        last_positions = merge_last_positions_risk_factors_alerts(
            last_positions, risk_factors, pending_alerts
        )

        # Load
        load_last_positions(last_positions)
