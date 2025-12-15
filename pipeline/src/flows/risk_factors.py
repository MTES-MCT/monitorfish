import duckdb
import pandas as pd
from prefect import flow, get_run_logger, task

from config import default_risk_factors, risk_factor_coefficients
from src.entities.vessel_profiles import VesselProfileType
from src.generic_tasks import extract, load
from src.processing import join_on_multiple_keys
from src.shared_tasks.dates import get_current_year
from src.shared_tasks.segments import (
    extract_control_priorities_and_infringement_risk_levels,
    extract_segments_of_year,
)


@task
def extract_current_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_segments.sql"
    )


@task
def extract_recent_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/recent_segments.sql"
    )


@task
def extract_usual_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/usual_segments.sql"
    )


@task
def extract_vessels_with_current_vms_fishing_activity() -> set:
    vessels_with_current_vms_fishing_activity = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/vessels_with_current_vms_fishing_activity.sql",
    )
    return set(vessels_with_current_vms_fishing_activity.cfr)


@task
def compute_profile_segments_impact_and_priority(
    profile_segments: pd.DataFrame,
    segments: pd.DataFrame,
    control_priorities: pd.DataFrame,
    profile_type: VesselProfileType,
) -> pd.DataFrame:
    segments_column = f"{profile_type.risk_factors_prefix}segments"
    segment_highest_impact_column = (
        f"{profile_type.risk_factors_prefix}segment_highest_impact"
    )
    impact_risk_factor_column = (
        f"{profile_type.risk_factors_prefix}segments_impact_risk_factor"
    )
    segment_highest_priority_column = (
        f"{profile_type.risk_factors_prefix}segment_highest_priority"
    )
    control_priority_level_column = (
        f"{profile_type.risk_factors_prefix}segments_control_priority_level"
    )
    gear_onboard_column = f"{profile_type.risk_factors_prefix}gear_onboard"

    segments_impact_dict = (
        segments[["segment", "impact_risk_factor"]]
        .set_index("segment")
        .to_dict()["impact_risk_factor"]
    )
    unnested_profile_segments = profile_segments.explode("segments").rename(
        columns={"segments": "segment"}
    )[["vessel_id", "cfr", "segment", "facade"]]
    unnested_profile_segments[
        "impact_risk_factor"
    ] = unnested_profile_segments.segment.map(segments_impact_dict)
    unnested_profile_segments = unnested_profile_segments.dropna(
        subset=["impact_risk_factor"]
    ).reset_index(drop=True)

    profile_segments_impact = (
        unnested_profile_segments.sort_values("impact_risk_factor", ascending=False)
        .groupby("cfr")[["cfr", "segment", "impact_risk_factor"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": segment_highest_impact_column,
                "impact_risk_factor": impact_risk_factor_column,
            }
        )
    )

    profile_segments_control_priorities = (
        pd.merge(
            unnested_profile_segments, control_priorities, on=["segment", "facade"]
        )
        .sort_values("control_priority_level", ascending=False)
        .groupby("cfr")[["cfr", "segment", "control_priority_level"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": segment_highest_priority_column,
                "control_priority_level": control_priority_level_column,
            }
        )
    )

    res = (
        profile_segments.rename(columns={"segments": segments_column})
        .set_index("cfr")
        .join(profile_segments_impact)
        .join(profile_segments_control_priorities)
        .rename(columns={"gear_onboard": gear_onboard_column})
        .reset_index()
    )

    res = res[
        [
            "cfr",
            "vessel_id",
            "ircs",
            "external_immatriculation",
            gear_onboard_column,
            segments_column,
            segment_highest_impact_column,
            impact_risk_factor_column,
            segment_highest_priority_column,
            control_priority_level_column,
        ]
    ]
    res[segments_column] = res[segments_column].map(lambda d: list(d.keys()))

    return res


@task
def extract_control_anteriority():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_anteriority.sql",
        parse_dates=[
            "last_control_datetime_utc",
            "last_control_at_sea_datetime_utc",
            "last_control_at_quay_datetime_utc",
        ],
    )


@task
def merge(
    current_segments: pd.DataFrame,
    recent_segments: pd.DataFrame,
    usual_segments: pd.DataFrame,
) -> pd.DataFrame:
    merged_segments = duckdb.sql(
        """
        SELECT
            COALESCE(cs.cfr::VARCHAR, rs.cfr::VARCHAR, us.cfr::VARCHAR) AS cfr,
            COALESCE(cs.vessel_id, rs.vessel_id, us.vessel_id) AS vessel_id,
            COALESCE(cs.ircs::VARCHAR, rs.ircs::VARCHAR, us.ircs::VARCHAR) AS ircs,
            COALESCE(cs.external_immatriculation::VARCHAR, rs.external_immatriculation::VARCHAR, us.external_immatriculation::VARCHAR) AS external_immatriculation,
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
            rs.recent_gear_onboard,
            rs.recent_segments,
            rs.recent_segment_highest_impact,
            rs.recent_segments_impact_risk_factor,
            rs.recent_segment_highest_priority,
            rs.recent_segments_control_priority_level,
            us.usual_gear_onboard,
            us.usual_segments,
            us.usual_segment_highest_impact,
            us.usual_segments_impact_risk_factor,
            us.usual_segment_highest_priority,
            us.usual_segments_control_priority_level
        FROM current_segments cs
        FULL OUTER JOIN usual_segments us
        ON us.cfr = cs.cfr
        FULL OUTER JOIN recent_segments rs
        ON rs.cfr = COALESCE(us.cfr::VARCHAR, cs.cfr::VARCHAR)
    """
    ).to_df()

    return merged_segments


@task
def compute_risk_factors(
    merged_segments: pd.DataFrame,
    control_anteriority: pd.DataFrame,
    vessels_with_current_vms_fishing_activity: set,
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

    risk_factors["last_control_infractions"] = risk_factors[
        "last_control_infractions"
    ].where(
        risk_factors["last_control_infractions"].notnull(),
        pd.Series([[]] * len(risk_factors)),
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
    risk_factors["usual_segments_detectability_risk_factor"] = (
        risk_factors["control_rate_risk_factor"]
        * risk_factors["usual_segments_control_priority_level"]
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
    risk_factors["usual_segments_risk_factor"] = (
        (
            risk_factors["usual_segments_impact_risk_factor"]
            ** risk_factor_coefficients["impact"]
        )
        * (
            risk_factors["probability_risk_factor"]
            ** risk_factor_coefficients["probability"]
        )
        * (
            risk_factors["usual_segments_detectability_risk_factor"]
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
    risk_factors["has_current_vms_fishing_activity"] = risk_factors.cfr.isin(
        vessels_with_current_vms_fishing_activity
    )

    return risk_factors


@task
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
        logger=get_run_logger(),
        pg_array_columns=["segments", "recent_segments", "usual_segments"],
        jsonb_columns=[
            "gear_onboard",
            "species_onboard",
            "last_control_infractions",
            "recent_gear_onboard",
            "usual_gear_onboard",
        ],
        nullable_integer_columns=["vessel_id"],
        how="replace",
    )


@flow(name="Monitorfish - Risk factors")
def risk_factors_flow():
    # Extract
    current_year = get_current_year()
    control_priorities = (
        extract_control_priorities_and_infringement_risk_levels.submit()
    )
    segments = extract_segments_of_year.submit(current_year)
    current_segments = extract_current_segments.submit()
    recent_segments = extract_recent_segments.submit()
    usual_segments = extract_usual_segments.submit()
    control_anteriority = extract_control_anteriority.submit()
    vessels_with_current_vms_fishing_activity = (
        extract_vessels_with_current_vms_fishing_activity.submit()
    )

    # Transform
    recent_segments = compute_profile_segments_impact_and_priority(
        recent_segments, segments, control_priorities, VesselProfileType.RECENT
    )
    usual_segments = compute_profile_segments_impact_and_priority(
        usual_segments, segments, control_priorities, VesselProfileType.USUAL
    )
    merged_segments = merge(current_segments, recent_segments, usual_segments)
    risk_factors = compute_risk_factors(
        merged_segments, control_anteriority, vessels_with_current_vms_fishing_activity
    )

    # Load
    load_risk_factors(risk_factors)
