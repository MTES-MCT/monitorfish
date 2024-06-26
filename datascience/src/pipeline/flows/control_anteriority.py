from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import prefect
import pytz
from dateutil.relativedelta import relativedelta
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import remove_nones_from_list, try_get_factory
from src.pipeline.shared_tasks.control_flow import check_flow_not_running

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
            name="number_recent_controls_bin",
        ),
        columns=pd.Index(
            control_rate_bins["time_since_last_control_labels"],
            name="time_since_last_control_bin",
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
    .rename("control_rate_risk_factor")
    .reset_index()
)

infraction_rate_bins = {
    "infraction_score_bins": [-10, 0, 11, 21, 10000],
    "infraction_score_risk_factors": [1, 2, 3, 4],
}

################################### Helper functions ###################################


def compute_control_dates_coefficients(
    control_dates: pd.Series, from_date: datetime, to_date: datetime
) -> pd.Series:
    """
    For each date in ``control_dates``, computes a coefficient determined by its
    distance from ``from_date`` relative to the distance between ``from_date`` and
    ``to_date``.

    Args:
            control_dates (pd.Series): Series of ``datetime.datetime``
            from_date (datetime): Start of time interval considered
            to_date (datetime): Start of time interval considered

    Returns:
            pd.Series: [description]

    Examples:
            >>> import pandas as pd
            >>> from datetime import datetime
            >>> from_date = datetime(2021, 1, 1)
            >>> to_date = datetime(2023, 1, 1)
            >>> dates = pd.Series([
                        datetime(2019, 6, 5),
                        datetime(2021, 1, 1),
                        datetime(2022, 1, 1),
                        datetime(2025, 5, 2)
                ])
            >>> compute_control_dates_coefficients(
                        dates,
                        from_date=from_date,
                        to_date=to_date
                )
            0    0.0
            1    0.0
            2    0.5
            3    0.0
            dtype: float64
    """
    control_interval = (to_date - from_date).total_seconds()
    coefficients = (control_dates - from_date).map(
        lambda timedelta: timedelta.total_seconds()
    ) / control_interval

    coefficients.update(
        np.where(
            ((coefficients >= 0) & (coefficients <= 1)),
            coefficients,
            0,
        )
    )

    return coefficients


def compute_control_ranks_coefficients(control_ranks: np.array) -> np.array:
    """Given a ``numpy.array`` of integers representing the rank of vessels controls
    over time, returns the corresponding coefficients with which they must be taken
    into account in the risk factor.

    The input array represents the controls of several vessels. For each vessel,
    controls are sorted from most to least recent and ranked (1, 2, 3...).

    The output is an array with the same shape which contains coefficients defined as:

      * 1.0 for controls of rank 1
      * 0.9 for controls of rank 2
      * ...
      * 0.1 for controls of rank 10
      * 0.0 for controls of rank 11+

    Args:
        control_ranks (np.array): 1D-array of integers >= 1

    Returns:
        np.array: array with the same shape and with coefficients between 1 (for
        controls of rank 1) and 0 (for controls of rank >= 10).

    Examples:
        >>> ranks = np.array([1, 4, 2, 2, 12, 2, 4])
        >>> compute_control_ranks_coefficients(ranks)
        np.array([1.0, 0.7, 0.9, 0.9, 0.0, 0.9, 0.7])
    """
    return np.where(control_ranks <= 10, (11 - control_ranks) / 10, 0)


#################################### Tasks and flows ###################################


@task(checkpoint=False)
def extract_last_years_controls(years: int) -> pd.DataFrame:
    """Extracts controls data of the last 5 years for all vessels.

    Returns:
        pd.DataFrame: all vessels' controls data for the last 5 years.
    """

    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_years_controls.sql",
        params={"years": years},
    )


@task(checkpoint=False)
def extract_fishing_infraction_natinfs() -> set:
    """Extracts all ``natinf_code`` of ``infractions`` related to fishing non-compliance
    (safety non compliance events are excluded).

    Returns:
        set: Set of infractions natinf_codes related to fishing
    """

    df = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fishing_infractions.sql",
    )

    fishing_infraction_ids = set(df["natinf_code"])

    return fishing_infraction_ids


@task(checkpoint=False)
def extract_vessels_most_recent_control(years: int) -> pd.DataFrame:
    """
    Extracts data about the most recent control of each vessel.

    Returns:
        pd.DataFrame: DataFrame containing the most recent control of each vessel
        within the last 5 years
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/vessels_most_recent_control.sql",
        params={"years": years},
    )


@task(checkpoint=False)
def transform_vessels_most_recent_control(controls: pd.DataFrame) -> pd.DataFrame:
    controls = controls.copy(deep=True)

    controls["last_control_infraction"] = controls.last_control_infractions.astype(bool)

    controls["infraction_comments"] = controls.last_control_infractions.map(
        lambda li: ", ".join(
            remove_nones_from_list(map(try_get_factory("comments"), li))
        )
    )
    controls["infraction_comments"] = controls.infraction_comments.where(
        controls.infraction_comments != "", None
    )

    controls["post_control_comments"] = controls.apply(
        lambda row: " - ".join(
            remove_nones_from_list(
                [row["post_control_comments"], row["infraction_comments"]]
            )
        ),
        axis=1,
    )

    controls["post_control_comments"] = controls.post_control_comments.where(
        controls.post_control_comments != "", None
    )
    controls = controls.drop(
        columns=["infraction_comments", "last_control_infractions"]
    )
    return controls


@task(checkpoint=False)
def compute_control_rate_risk_factors(controls: pd.DataFrame) -> pd.DataFrame:
    """Given controls data on 3+ years, computes the control rate risk factor of each
    vessel.

    The idea is that vessels that have been controlled less over the past 3 years and
    that have not been controlled for a certain time have a higher priority of control
    than vessels that were controlled many times over the past 3 years and that were
    controlled recently.

    Args:
        controls (pd.DataFrame): ``pd.DataFrame`` of controls data on the last 3+ years

    Returns:
        pd.DataFrame: for each vessel, the component of the risk factor related to the
        control rate of each vessel.
    """

    columns = [
        "vessel_id",
        "control_datetime_utc",
    ]

    controls_ = controls[columns].copy(deep=True)

    now = pytz.utc.localize(datetime.utcnow())

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

    control_rate_risk_factors["time_since_last_control_bin"] = pd.cut(
        control_rate_risk_factors["time_since_last_control"],
        bins=control_rate_bins["time_since_last_control_bins"],
        labels=control_rate_bins["time_since_last_control_labels"],
    )

    control_rate_risk_factors["number_recent_controls_bin"] = pd.cut(
        control_rate_risk_factors["number_recent_controls"],
        bins=control_rate_bins["number_recent_controls_bins"],
        labels=control_rate_bins["number_recent_controls_labels"],
    )

    # Compute the risk factor
    control_rate_risk_factors = pd.merge(
        control_rate_risk_factors,
        control_rate_bins_risk_factors,
        on=["number_recent_controls_bin", "time_since_last_control_bin"],
    )

    control_rate_risk_factors = control_rate_risk_factors.drop(
        columns=[
            "time_since_last_control",
            "number_recent_controls_bin",
            "time_since_last_control_bin",
        ]
    )

    return control_rate_risk_factors


@task(checkpoint=False)
def compute_infraction_rate_risk_factors(
    controls: pd.DataFrame, fishing_infraction_natinfs: set
) -> pd.DataFrame:
    """Given control results data of vessels, computes the
    infraction rate risk factor of each vessel.

    The idea is that vessels which committed infractions in the past have a higher
    priority of control than vessels that were in order.

    Only violations related to fishing non-compliance are taken into account. Safety
    non-compliance evens are not taken into account.

    If a vessel was controlled more than 10 times, only the 10 most recent control
    results are taken into account.

    Args:
        controls (pd.DataFrame): control results data
        fishing_infraction_natinfs (set): set of infractions natinfs related to fishing
          non-compliance.

    Returns:
        pd.DataFrame: for each vessel, the component of the risk factor related to the
        infraction rate of each vessel.
    """
    columns = ["vessel_id", "control_datetime_utc", "infractions_natinf_codes"]
    controls = controls[columns].copy(deep=True)

    controls["n_fishing_infractions"] = controls["infractions_natinf_codes"].map(
        lambda li: sum(map(lambda x: x in fishing_infraction_natinfs, li))
    )

    controls["points"] = controls["n_fishing_infractions"] * 10 - (
        controls["n_fishing_infractions"] == 0
    ).astype(int)

    controls["control_rank"] = controls.groupby("vessel_id")[
        "control_datetime_utc"
    ].rank(ascending=False, method="average")

    controls["coefficient"] = compute_control_ranks_coefficients(
        controls.control_rank.values
    )

    controls["weighted_points"] = controls["coefficient"] * controls["points"]

    infraction_rate_risk_factors = (
        controls.groupby("vessel_id")["weighted_points"]
        .sum()
        .rename("infraction_score")
        .reset_index()
    )

    infraction_rate_risk_factors["infraction_rate_risk_factor"] = pd.cut(
        infraction_rate_risk_factors.infraction_score,
        infraction_rate_bins["infraction_score_bins"],
        labels=infraction_rate_bins["infraction_score_risk_factors"],
    )

    return infraction_rate_risk_factors


@task(checkpoint=False)
def compute_control_statistics(controls: pd.DataFrame) -> pd.DataFrame:
    """
    Computes control statistics per vessel.

    Args:
        controls (pd.DataFrame): Controls data, output of extract_last_years_controls

    Return
        pd.DataFrame: control statistics per vessel
    """

    control_statistics_5_years = (
        controls.fillna({"seizure_and_diversion": False})
        .assign(
            number_infractions_last_5_years=lambda x: x.infractions_natinf_codes.map(
                len
            )
        )
        .groupby("vessel_id")[
            [
                "id",
                "number_infractions_last_5_years",
                "seizure_and_diversion",
                "has_some_species_seized",
                "has_some_gears_seized",
            ]
        ]
        .agg(
            {
                "id": "count",
                "number_infractions_last_5_years": "sum",
                "seizure_and_diversion": "sum",
                "has_some_gears_seized": "sum",
                "has_some_species_seized": "sum",
            }
        )
        .rename(
            columns={
                "id": "number_controls_last_5_years",
                "seizure_and_diversion": "number_vessel_seizures_last_5_years",
                "has_some_gears_seized": "number_gear_seizures_last_5_years",
                "has_some_species_seized": ("number_species_seizures_last_5_years"),
            }
        )
        .reset_index()
    )

    control_statistics_3_years = (
        controls[
            (
                controls.control_datetime_utc
                > pytz.utc.localize(datetime.utcnow()) - relativedelta(years=3)
            )
        ]
        .groupby("vessel_id")["id"]
        .count()
        .rename("number_controls_last_3_years")
        .reset_index()
    )

    control_statistics = pd.merge(
        control_statistics_5_years,
        control_statistics_3_years,
        on="vessel_id",
        how="outer",
    )

    control_statistics["number_controls_last_3_years"] = (
        control_statistics["number_controls_last_3_years"].fillna(0).astype(int)
    )

    return control_statistics


@task(checkpoint=False)
def merge(
    control_rate_risk_factors: pd.DataFrame,
    infraction_rate_risk_factor: pd.DataFrame,
    last_controls: pd.DataFrame,
    control_statistics: pd.DataFrame,
) -> pd.DataFrame:
    """Merge of ``pd.DataFrame`` to produce output of the flow. The join is performed
    on ``vessel_id``.

    Args:
        control_rate_risk_factors (pd.DataFrame): output of
        ``compute_control_rate_risk_factors`` task
        infraction_rate_risk_factor (pd.DataFrame): output of
        ``compute_infraction_rate_risk_factors`` task
        last_controls (pd.DataFrame): output of ``get_last_controls`` task

    Returns:
        pd.DataFrame: join of the 3 input ``pd.DataFrame``
    """

    res = pd.merge(
        control_rate_risk_factors, infraction_rate_risk_factor, on="vessel_id"
    )

    res = pd.merge(last_controls, res, on="vessel_id")
    res = pd.merge(control_statistics, res, on="vessel_id")

    return res


@task(checkpoint=False)
def load_control_anteriority(control_anteriority: pd.DataFrame):
    """Load the output of ``merge`` task into ``control_anteriority`` table.

    Args:
        control_anteriority (pd.DataFrame): output of ``merge`` task.
    """

    load(
        control_anteriority,
        table_name="control_anteriority",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        jsonb_columns=[
            "last_control_logbook_infractions",
            "last_control_gear_infractions",
            "last_control_species_infractions",
            "last_control_other_infractions",
        ],
    )


with Flow("Control anteriority", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        number_years = Parameter("number_years", 5)

        # Extract
        controls = extract_last_years_controls(number_years)
        vessels_most_recent_control = extract_vessels_most_recent_control(number_years)
        fishing_infraction_ids = extract_fishing_infraction_natinfs()

        # Transform
        vessels_most_recent_control = transform_vessels_most_recent_control(
            vessels_most_recent_control
        )
        control_statistics = compute_control_statistics(controls)
        control_rate_risk_factors = compute_control_rate_risk_factors(controls)
        infraction_rate_risk_factors = compute_infraction_rate_risk_factors(
            controls, fishing_infraction_ids
        )
        control_anteriority = merge(
            control_rate_risk_factors,
            infraction_rate_risk_factors,
            vessels_most_recent_control,
            control_statistics,
        )
        load_control_anteriority(control_anteriority)

flow.file_name = Path(__file__).name
