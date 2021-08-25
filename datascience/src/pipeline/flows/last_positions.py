from datetime import datetime

import numpy as np
import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.flows.risk_factor import default_risk_factors
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.spatial import estimate_current_position
from src.pipeline.processing import (
    get_first_non_null_column_name,
    join_on_multiple_keys,
)


@task(checkpoint=False)
def extract_last_positions():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_positions.sql",
        dtypes={"emission_period": str},
    )


@task(checkpoint=False)
def extract_risk_factors():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/risk_factors.sql",
    )


@task(checkpoint=False)
def estimate_current_positions(last_positions):

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
            time_since_last_position=(
                (now - row["last_position_datetime_utc"]).total_seconds() / 3600
            ),
            max_time_since_last_position=2,
            on_error="ignore",
        ),
        axis=1,
        result_type="expand",
    )

    return last_positions


@task(checkpoint=False)
def merge(last_positions, risk_factors):
    vessel_identifier_labels = {
        "cfr": "INTERNAL_REFERENCE_NUMBER",
        "ircs": "IRCS",
        "external_immatriculation": "EXTERNAL_REFERENCE_NUMBER",
    }

    last_positions["vessel_identifier"] = get_first_non_null_column_name(
        last_positions[["cfr", "ircs", "external_immatriculation"]],
        vessel_identifier_labels,
    )

    last_positions = join_on_multiple_keys(
        last_positions,
        risk_factors,
        on=["cfr", "ircs", "external_immatriculation"],
        how="left",
    )

    last_positions = last_positions.fillna(
        {**default_risk_factors, "total_weight_onboard": 0.0}
    )

    last_positions.loc[:, "trip_number"] = last_positions.trip_number.map(
        lambda x: str(int(x)), na_action="ignore"
    ).replace([np.nan], [None])

    last_positions.loc[:, "emission_period"] = last_positions.emission_period.replace(
        ["NaT", np.nan], [None, None]
    )

    last_positions["id"] = np.arange(0, len(last_positions))

    return last_positions


@task(checkpoint=False)
def load_last_positions(last_positions):

    load(
        last_positions,
        table_name="last_positions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
        pg_array_columns=["segments"],
        handle_array_conversion_errors=True,
        value_on_array_conversion_error="{}",
        jsonb_columns=["gear_onboard", "species_onboard"],
    )


with Flow("Last positions") as flow:
    last_positions = extract_last_positions()
    risk_factors = extract_risk_factors()
    last_positions = estimate_current_positions(last_positions)
    last_positions = merge(last_positions, risk_factors)
    load_last_positions(last_positions)
