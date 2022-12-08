from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from config import default_risk_factors, risk_factor_coefficients
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import join_on_multiple_keys
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_current_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_segments.sql"
    )


@task(checkpoint=False)
def extract_control_anteriority():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_anteriority.sql",
        parse_dates=["last_control_datetime_utc"],
    )


@task(checkpoint=False)
def compute_risk_factors(
    current_segments: pd.DataFrame, control_anteriority: pd.DataFrame
):
    risk_factors = join_on_multiple_keys(
        control_anteriority,
        current_segments,
        or_join_keys=["vessel_id"],
        how="outer",
        coalesce_common_columns=True,
    )

    risk_factors = risk_factors.fillna(
        {
            "number_controls_last_3_years": 0,
            "number_controls_last_5_years": 0,
            "number_diversions_last_5_years": 0,
            "number_escorts_to_quay_last_5_years": 0,
            "number_infractions_last_5_years": 0,
            "number_recent_controls": 0,
            "number_seizures_last_5_years": 0,
            **default_risk_factors,
        }
    )

    risk_factors["probability_risk_factor"] = risk_factors[
        "infraction_rate_risk_factor"
    ]

    risk_factors["detectability_risk_factor"] = (
        risk_factors["control_rate_risk_factor"]
        * risk_factors["control_priority_level"]
    ) ** 0.5

    risk_factors["risk_factor"] = (
        (risk_factors["impact_risk_factor"] ** risk_factor_coefficients["impact"])
        * (
            risk_factors["probability_risk_factor"]
            ** risk_factor_coefficients["probability"]
        )
        * (
            risk_factors["detectability_risk_factor"]
            ** risk_factor_coefficients["detectability"]
        )
    )

    risk_factors = risk_factors.astype(
        {
            "number_controls_last_3_years": int,
            "number_controls_last_5_years": int,
            "number_diversions_last_5_years": int,
            "number_escorts_to_quay_last_5_years": int,
            "number_infractions_last_5_years": int,
            "number_recent_controls": int,
            "number_seizures_last_5_years": int,
        }
    )

    def float_or_na_to_str(float_or_na) -> str:
        if pd.isna(float_or_na):
            return ""
        else:
            return str(int(float_or_na))

    risk_factors["vessel_id"] = risk_factors.vessel_id.map(float_or_na_to_str)

    return risk_factors


@task(checkpoint=False)
def load_risk_factors(risk_factors: pd.DataFrame):
    """Load the output of ``compute_risk_factors`` task into ``risk_factors`` table.

    Args:
        risk_factors (pd.DataFrame): output of ``compute_risk_factors`` task.
    """

    load(
        risk_factors,
        table_name="risk_factors",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        pg_array_columns=["segments"],
        jsonb_columns=["gear_onboard", "species_onboard"],
        how="replace",
    )


with Flow("Risk factor", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        current_segments = extract_current_segments()
        control_anteriority = extract_control_anteriority()
        risk_factors = compute_risk_factors(current_segments, control_anteriority)
        load_risk_factors(risk_factors)

flow.file_name = Path(__file__).name
