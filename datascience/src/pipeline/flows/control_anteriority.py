from datetime import datetime

import numpy as np
import pandas as pd
import prefect
from dateutil.relativedelta import relativedelta
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load

######## Parameters for control rate and infraction rate risk factor components ########

control_rate_bins = {
    "time_since_last_control_bins": [0, 0.166, 0.417, 0.75, 1.5, 3, 100],  # in years
    "time_since_last_control_labels": [
        "< 2 mois",
        "2 à 5 mois",
        "5 à 9 mois",
        "9 mois à 1.5 ans",
        "1.5 à 3 ans",
        "> 3 ans",
    ],
    "number_recent_controls_bins": [-0.01, 0.001, 0.5, 1.2, 2.4, 100],
    "number_recent_controls_labels": [
        "0",
        "0 - 0.5",
        "0.5 - 1.2",
        "1.2 - 2.4",
        "> 2.4",
    ],
}

control_rate_bins_risk_factors = pd.DataFrame(
    pd.DataFrame(
        index=pd.Index(
            control_rate_bins["number_recent_controls_labels"],
            name="number_recent_controls",
        ),
        columns=pd.Index(
            control_rate_bins["time_since_last_control_labels"],
            name="time_since_last_control",
        ),
        data=[
            [4.00, 4.00, 4.00, 4.00, 4.00, 4.00],
            [3.25, 3.25, 3.25, 3.25, 4.00, 4.00],
            [2.50, 2.50, 2.50, 3.25, 3.25, 4.00],
            [1.75, 1.75, 2.50, 3.25, 3.25, 4.00],
            [1.00, 1.75, 2.50, 3.25, 3.25, 4.00],
        ],
    )
    .stack()
    .rename("risk_factor")
    .reset_index()
)

################################### Helper functions ###################################


def compute_control_dates_coefficients(
    control_dates: pd.Series, from_date: datetime, to_date: datetime
) -> pd.Series:

    control_interval = (to_date - from_date).total_seconds()

    control_dates_coefficients = (control_dates - from_date).map(
        lambda timedelta: timedelta.total_seconds()
    ) / control_interval

    control_dates_coefficients.update(
        np.where(
            ((control_dates_coefficients >= 0) & (control_dates_coefficients <= 1)),
            control_dates_coefficients,
            0,
        )
    )

    return control_dates_coefficients


#################################### Tasks and flows ###################################


@task(checkpoint=False)
def extract_last_years_controls(years: float = 5):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_years_controls.sql",
        params={"years": years},
    )


@task(checkpoint=False)
def extract_fishing_infraction_ids() -> set:
    df = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fishing_infractions.sql",
    )

    fishing_infraction_ids = set(df["id"])

    return fishing_infraction_ids


@task(checkpoint=False)
def get_last_controls(controls: pd.DataFrame) -> pd.DataFrame:

    columns = {
        "vessel_id": "vessel_id",
        "cfr": "cfr",
        "ircs": "ircs",
        "external_immatriculation": "external_immatriculation",
        "control_datetime_utc": "last_control_datetime_utc",
        "infraction": "last_control_infraction",
        "post_control_comments": "post_control_comments",
    }

    last_controls = (
        controls[columns]
        .sort_values("control_datetime_utc", ascending=False)
        .groupby("vessel_id", as_index=True)
        .head(1)
        .copy(deep=True)
        .rename(columns=columns)
    )

    return last_controls


@task(checkpoint=False)
def compute_control_rate_risk_factors(controls: pd.DataFrame) -> pd.DataFrame:

    columns = [
        "vessel_id",
        "control_datetime_utc",
    ]

    controls_ = controls[columns].copy(deep=True)

    now = datetime.utcnow()

    # Compute the number of "recent controls" of each vessen with a discount
    # coefficient on control dates and get the datetime of the last control of each
    # vessel
    controls_["control_date_coefficient"] = compute_control_dates_coefficients(
        controls_["control_datetime_utc"],
        from_date=now - relativedelta(years=3),
        to_date=now,
    )

    control_rate_risk_factors = (
        controls_.groupby("vessel_id")
        .agg({"control_datetime_utc": "max", "control_date_coefficient": "sum"})
        .rename(
            columns={
                "control_datetime_utc": "last_control_datetime_utc",
                "control_date_coefficient": "number_recent_controls",
            }
        )
        .reset_index()
    )

    # Put vessels into bins according their number of recent controls and time since
    # the last control
    control_rate_risk_factors["time_since_last_control"] = (
        (now - control_rate_risk_factors["last_control_datetime_utc"]).map(
            lambda dt: dt.total_seconds()
        )
        / 3600
        / 24
        / 365
    )

    control_rate_risk_factors["time_since_last_control"] = pd.cut(
        control_rate_risk_factors["time_since_last_control"],
        bins=control_rate_bins["time_since_last_control_bins"],
        labels=control_rate_bins["time_since_last_control_labels"],
    )

    control_rate_risk_factors["number_recent_controls"] = pd.cut(
        control_rate_risk_factors["number_recent_controls"],
        bins=control_rate_bins["number_recent_controls_bins"],
        labels=control_rate_bins["number_recent_controls_labels"],
    )

    control_rate_risk_factors = control_rate_risk_factors.drop(
        columns=["last_control_datetime_utc"]
    )

    # Compute the risk factor
    control_rate_risk_factors = pd.merge(
        control_rate_risk_factors,
        control_rate_bins_risk_factors,
        on=["number_recent_controls", "time_since_last_control"],
    )

    return control_rate_risk_factors


@task(checkpoint=False)
def compute_infraction_rate_risk_factors(
    controls: pd.DataFrame, fishing_infraction_ids: set
) -> pd.DataFrame:
    pass


@task(checkpoint=False)
def merge(
    control_rate_risk_factors: pd.DataFrame,
    infraction_rate_risk_factor: pd.DataFrame,
    last_controls: pd.DataFrame,
) -> pd.DataFrame:
    pass


@task(checkpoint=False)
def load_control_anteriority(control_anteriority: pd.DataFrame):

    load(
        control_anteriority,
        table_name="control_anteriority",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
    )


with Flow("Control anteriority") as flow:
    controls = extract_last_years_controls(years=5)
    fishing_infraction_ids = extract_fishing_infraction_ids()
    last_controls = get_last_controls(controls)
    control_rate_risk_factors = compute_control_rate_risk_factors(controls)
    infraction_rate_risk_factors = compute_infraction_rate_risk_factors(
        controls, fishing_infraction_ids
    )
    control_anteriority = merge(
        control_rate_risk_factors, infraction_rate_risk_factors, last_controls
    )
    load_control_anteriority(control_anteriority)
