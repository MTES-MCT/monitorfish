import pandas as pd
import prefect
from prefect import Flow, task

from config import default_risk_factors, risk_factor_coefficients
from src.pipeline.generic_tasks import extract, load


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
    risk_factors = pd.merge(
        current_segments, control_anteriority, on="cfr", how="outer"
    )

    risk_factors = risk_factors.fillna(default_risk_factors)

    risk_factors = risk_factors.rename(
        columns={
            "infraction_rate_risk_factor": "probability_risk_factor",
        }
    )

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

    risk_factors = risk_factors.drop(
        columns=["vessel_id", "control_priority_level", "control_rate_risk_factor"]
    )

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


with Flow("Risk factor") as flow:
    current_segments = extract_current_segments()
    control_anteriority = extract_control_anteriority()
    risk_factors = compute_risk_factors(current_segments, control_anteriority)
    load_risk_factors(risk_factors)
