from pathlib import Path

import duckdb
import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from config import default_risk_factors, risk_factor_coefficients
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import join_on_multiple_keys
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_current_year
from src.pipeline.shared_tasks.segments import (
    extract_control_priorities,
    extract_segments_of_year,
)


@task(checkpoint=False)
def extract_current_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_segments.sql"
    )


@task(checkpoint=False)
def extract_recent_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/recent_segments.sql"
    )


@task(checkpoint=False)
def compute_recent_segments_impact_and_priority(
    recent_segments: pd.DataFrame,
    segments: pd.DataFrame,
    control_priorities: pd.DataFrame,
) -> pd.DataFrame:
    segments_impact_dict = (
        segments[["segment", "impact_risk_factor"]]
        .set_index("segment")
        .to_dict()["impact_risk_factor"]
    )
    unnested_recent_segments = recent_segments.explode("recent_segments").rename(
        columns={"recent_segments": "segment"}
    )[["vessel_id", "cfr", "segment", "facade"]]
    unnested_recent_segments[
        "impact_risk_factor"
    ] = unnested_recent_segments.segment.map(segments_impact_dict)
    unnested_recent_segments = unnested_recent_segments.dropna(
        subset=["impact_risk_factor"]
    ).reset_index(drop=True)

    recent_segments_impact = (
        unnested_recent_segments.sort_values("impact_risk_factor", ascending=False)
        .groupby("cfr")[["cfr", "segment", "impact_risk_factor"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": "recent_segment_highest_impact",
                "impact_risk_factor": "recent_segments_impact_risk_factor",
            }
        )
    )

    recent_segment_control_priorities = (
        pd.merge(unnested_recent_segments, control_priorities, on=["segment", "facade"])
        .sort_values("control_priority_level", ascending=False)
        .groupby("cfr")[["cfr", "segment", "control_priority_level"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": "recent_segment_highest_priority",
                "control_priority_level": "recent_segments_control_priority_level",
            }
        )
    )

    res = (
        recent_segments.set_index("cfr")
        .join(recent_segments_impact)
        .join(recent_segment_control_priorities)
        .reset_index()
    )

    res = res[
        [
            "cfr",
            "vessel_id",
            "ircs",
            "external_immatriculation",
            "recent_gears",
            "recent_segments",
            "recent_segment_highest_impact",
            "recent_segments_impact_risk_factor",
            "recent_segment_highest_priority",
            "recent_segments_control_priority_level",
        ]
    ]
    res["recent_gears"] = res.recent_gears.map(lambda d: list(d.keys()))
    res["recent_segments"] = res.recent_segments.map(lambda d: list(d.keys()))

    return res


@task(checkpoint=False)
def extract_control_anteriority():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_anteriority.sql",
        parse_dates=["last_control_datetime_utc"],
    )


@task(checkpoint=False)
def merge(
    current_segments: pd.DataFrame, recent_segments: pd.DataFrame
) -> pd.DataFrame:
    merged_segments = duckdb.sql(
        """
        SELECT
            COALESCE(cs.cfr, rs.cfr) AS cfr,
            COALESCE(cs.vessel_id, rs.vessel_id) AS vessel_id,
            COALESCE(cs.ircs, rs.ircs) AS ircs,
            COALESCE(cs.external_immatriculation, rs.external_immatriculation) AS external_immatriculation,
            cs.last_logbook_message_datetime_utc,
            cs.departure_datetime_utc,
            cs.trip_number,
            cs.gear_onboard,
            cs.species_onboard,
            cs.segments,
            cs.total_weight_onboard,
            cs.impact_risk_factor,
            cs.control_priority_level,
            cs.segment_highest_impact,
            cs.segment_highest_priority,
            rs.recent_gears,
            rs.recent_segments,
            rs.recent_segment_highest_impact,
            rs.recent_segments_impact_risk_factor,
            rs.recent_segment_highest_priority,
            rs.recent_segments_control_priority_level
        FROM current_segments cs
        FULL OUTER JOIN recent_segments rs
        ON cs.cfr = rs.cfr
    """
    ).to_df()

    return merged_segments


@task(checkpoint=False)
def compute_risk_factors(
    merged_segments: pd.DataFrame, control_anteriority: pd.DataFrame
):
    risk_factors = join_on_multiple_keys(
        control_anteriority,
        merged_segments,
        # Matching on CFR is required for vessels that no longer reside in the
        # `vessels` table and therefore have no `vessel_id` in the `current_segments`
        # DataFrame but have a control history and therefore have a non null
        # `vessel_id` in the `control_anteriority` DataFrame.
        or_join_keys=["vessel_id", "cfr"],
        how="outer",
        coalesce_common_columns=True,
    )

    risk_factors = risk_factors.fillna(
        {
            "number_controls_last_3_years": 0,
            "number_controls_last_5_years": 0,
            "number_gear_seizures_last_5_years": 0,
            "number_species_seizures_last_5_years": 0,
            "number_infractions_last_5_years": 0,
            "number_recent_controls": 0,
            "number_vessel_seizures_last_5_years": 0,
            **default_risk_factors,
        }
    )

    last_control_infraction_columns = [
        "last_control_logbook_infractions",
        "last_control_gear_infractions",
        "last_control_species_infractions",
        "last_control_other_infractions",
    ]

    for c in last_control_infraction_columns:
        risk_factors[c] = risk_factors[c].where(
            risk_factors[c].notnull(), pd.Series([[]] * len(risk_factors))
        )

    risk_factors["probability_risk_factor"] = risk_factors[
        "infraction_rate_risk_factor"
    ]

    risk_factors["detectability_risk_factor"] = (
        risk_factors["control_rate_risk_factor"]
        * risk_factors["control_priority_level"]
    ) ** 0.5
    risk_factors["recent_segments_detectability_risk_factor"] = (
        risk_factors["control_rate_risk_factor"]
        * risk_factors["recent_segments_control_priority_level"]
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
    risk_factors["recent_segments_risk_factor"] = (
        (
            risk_factors["recent_segments_impact_risk_factor"]
            ** risk_factor_coefficients["impact"]
        )
        * (
            risk_factors["probability_risk_factor"]
            ** risk_factor_coefficients["probability"]
        )
        * (
            risk_factors["recent_segments_detectability_risk_factor"]
            ** risk_factor_coefficients["detectability"]
        )
    )
    risk_factors = risk_factors.astype(
        {
            "number_controls_last_3_years": int,
            "number_controls_last_5_years": int,
            "number_gear_seizures_last_5_years": int,
            "number_species_seizures_last_5_years": int,
            "number_infractions_last_5_years": int,
            "number_recent_controls": int,
            "number_vessel_seizures_last_5_years": int,
        }
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
        pg_array_columns=["segments", "recent_segments"],
        jsonb_columns=[
            "gear_onboard",
            "species_onboard",
            "last_control_logbook_infractions",
            "last_control_gear_infractions",
            "last_control_species_infractions",
            "last_control_other_infractions",
            "recent_gears",
        ],
        nullable_integer_columns=["vessel_id"],
        how="replace",
    )


with Flow("Risk factor", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        current_year = get_current_year()
        control_priorities = extract_control_priorities()
        segments = extract_segments_of_year(current_year)
        current_segments = extract_current_segments()
        recent_segments = extract_recent_segments()
        recent_segments = compute_recent_segments_impact_and_priority(
            recent_segments, segments, control_priorities
        )
        merged_segments = merge(current_segments, recent_segments)
        control_anteriority = extract_control_anteriority()
        risk_factors = compute_risk_factors(merged_segments, control_anteriority)
        load_risk_factors(risk_factors)

flow.file_name = Path(__file__).name
