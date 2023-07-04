from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
import pytz
from dateutil.relativedelta import relativedelta

from src.pipeline.flows.control_anteriority import (
    compute_control_rate_risk_factors,
    compute_control_statistics,
    compute_infraction_rate_risk_factors,
    extract_fishing_infraction_natinfs,
    extract_last_years_controls,
    extract_vessels_most_recent_control,
    flow,
    transform_vessels_most_recent_control,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_datetime_utcnow

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def infraction_natinf_codes() -> set:
    return {27724, 17, 1030, 22206, 22222}


@pytest.fixture
def last_years_controls():
    return pd.DataFrame(
        {
            "id": [
                -199999,
                -144762,
                1,
                2,
                3,
                4,
                6,
                7,
                8,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
            ],
            "vessel_id": [
                483,
                483,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                3,
                4,
                4,
            ],
            "control_datetime_utc": [
                pytz.utc.localize(datetime(2015, 1, 1)),
                pytz.utc.localize(datetime(2021, 1, 1)),
                pytz.utc.localize(datetime(2015, 1, 1)),
                pytz.utc.localize(datetime(2020, 1, 1)),
                pytz.utc.localize(datetime(2020, 4, 1)),
                pytz.utc.localize(datetime(2021, 1, 1)),
                pytz.utc.localize(datetime(2021, 5, 1)),
                pytz.utc.localize(datetime(2021, 6, 1)),
                pytz.utc.localize(datetime(2021, 7, 1)),
                pytz.utc.localize(datetime(2021, 8, 1)),
                pytz.utc.localize(datetime(2022, 1, 1)),
                pytz.utc.localize(datetime(2022, 2, 1)),
                pytz.utc.localize(datetime(2022, 5, 1)),
                pytz.utc.localize(datetime(2022, 11, 1)),
                pytz.utc.localize(datetime(2022, 12, 31)),
                pytz.utc.localize(datetime(2023, 1, 1)),
                pytz.utc.localize(datetime(2023, 2, 15)),
                pytz.utc.localize(datetime(2023, 5, 1)),
                pytz.utc.localize(datetime(2023, 7, 1)),
                pytz.utc.localize(datetime(2023, 11, 1)),
                pytz.utc.localize(datetime(2023, 1, 1)),
                pytz.utc.localize(datetime(2025, 1, 1)),
                pytz.utc.localize(datetime(2025, 1, 2)),
            ],
            "infractions_natinf_codes": [
                [],
                [],
                [17, 1030, 1031, 22206],
                [22182],
                [20233],
                [],
                [27724, 2606, 4761, 22206],
                [17],
                [1030],
                [7061],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [7061],
                [],
            ],
            "seizure_and_diversion": [
                True,
                True,
                False,
                False,
                True,
                False,
                True,
                False,
                False,
                True,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "has_some_species_seized": [
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                True,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
            ],
            "has_some_gears_seized": [
                False,
                False,
                False,
                False,
                False,
                False,
                True,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
            ],
        }
    )


@pytest.fixture
def vessels_most_recent_control() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 483],
            "cfr": ["ABC000306959", "ABC000542519", "ABC000055481", None, None],
            "ircs": ["LLUK", "FQ7058", "IL2468", "OLY7853", None],
            "external_immatriculation": [
                "RV348407",
                "RO237719",
                "AS761555",
                "SB125334",
                None,
            ],
            "last_control_infractions": [
                [
                    {"natinf": 17, "comments": "Infraction espèces 1"},
                    {"natinf": 1030},
                    {"natinf": 1031},
                    {
                        "natinf": 22206,
                        "comments": "Infraction 1",
                        "infractionType": "WITH_RECORD",
                    },
                ],
                [
                    {
                        "natinf": 7061,
                        "comments": "Infraction 7",
                        "infractionType": "WITH_RECORD",
                    }
                ],
                [],
                [],
                [],
            ],
            "post_control_comments": [
                "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés",
                (
                    "Saisie: APPREHNTION DE 1600 KG DE SCE - "
                    "PECHE DE LA SCE EN ZONE 5 FERMEE - APPREHENTION DE 1600 KG DE SCE"
                ),
                None,
                "RAS",
                "Contrôle Poséidon à mettre à jour",
            ],
        }
    )


@pytest.fixture
def transformed_vessels_most_recent_control():
    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 483],
            "cfr": ["ABC000306959", "ABC000542519", "ABC000055481", None, None],
            "ircs": ["LLUK", "FQ7058", "IL2468", "OLY7853", None],
            "external_immatriculation": [
                "RV348407",
                "RO237719",
                "AS761555",
                "SB125334",
                None,
            ],
            "post_control_comments": [
                (
                    "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés - "
                    "Infraction espèces 1, Infraction 1"
                ),
                (
                    "Saisie: APPREHNTION DE 1600 KG DE SCE - "
                    "PECHE DE LA SCE EN ZONE 5 FERMEE - "
                    "APPREHENTION DE 1600 KG DE SCE - Infraction 7"
                ),
                None,
                "RAS",
                "Contrôle Poséidon à mettre à jour",
            ],
            "last_control_infraction": [True, True, False, False, False],
        }
    )


@pytest.fixture
def control_rate_risk_factors() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 483],
            "number_recent_controls": [
                0.41643835616438357,
                6.545205479452054,
                0.6675799086757991,
                0.0009132420091324201,
            ],
            "control_rate_risk_factor": [4.0, 1.0, 3.25, 4.0],
        }
    )


@pytest.fixture
def infraction_rate_risk_factors() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 483],
            "infraction_score": [45.2, -5.5, -1.0, -1.9, -1.9],
            "infraction_rate_risk_factor": [4, 1, 1, 1, 1],
        }
    )


@pytest.fixture
def control_statistics() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 483],
            "number_controls_last_5_years": [7, 11, 1, 2, 2],
            "number_infractions_last_5_years": [12, 1, 0, 1, 0],
            "number_vessel_seizures_last_5_years": [2, 1, 0, 0, 2],
            "number_gear_seizures_last_5_years": [1, 0, 0, 0, 0],
            "number_species_seizures_last_5_years": [1, 0, 0, 0, 0],
            "number_controls_last_3_years": [4, 11, 1, 2, 1],
        }
    )


@pytest.fixture
def loaded_control_anteriority() -> pd.DataFrame:
    now = pytz.utc.localize(datetime.utcnow())

    return pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 483],
            "cfr": ["ABC000306959", "ABC000542519", "ABC000055481", None, None],
            "ircs": ["LLUK", "FQ7058", "IL2468", "OLY7853", None],
            "external_immatriculation": [
                "RV348407",
                "RO237719",
                "AS761555",
                "SB125334",
                None,
            ],
            "last_control_datetime_utc": [
                now - relativedelta(weeks=3),
                now - relativedelta(weeks=2),
                now - relativedelta(weeks=1),
                now - relativedelta(weeks=1, days=2),
                now - relativedelta(months=3),
            ],
            "last_control_infraction": [True, True, False, False, False],
            "post_control_comments": [
                (
                    "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés - "
                    "Infraction espèces 1, Infraction 1"
                ),
                (
                    "Saisie: APPREHNTION DE 1600 KG DE SCE - "
                    "PECHE DE LA SCE EN ZONE 5 FERMEE - APPREHENTION DE 1600 KG DE SCE "
                    "- Infraction 7"
                ),
                None,
                "RAS",
                "Contrôle Poséidon à mettre à jour",
            ],
            "number_recent_controls": [
                2.45072991,
                5.50638683,
                0.99361314,
                1.98266423,
                1.83120437,
            ],
            "control_rate_risk_factor": [1.75, 1.75, 2.5, 2.5, 1.75],
            "infraction_score": [54.9, -5.5, -1.0, -1.0, -1.9],
            "infraction_rate_risk_factor": [4.0, 1.0, 1.0, 1.0, 1.0],
            "number_controls_last_5_years": [7, 11, 1, 1, 2],
            "number_controls_last_3_years": [5, 11, 1, 1, 2],
            "number_infractions_last_5_years": [12, 1, 0, 0, 0],
            "number_gear_seizures_last_5_years": [1, 0, 0, 0, 0],
            "number_species_seizures_last_5_years": [1, 0, 0, 0, 0],
            "number_vessel_seizures_last_5_years": [2, 1, 0, 0, 2],
        }
    )


def test_extract_last_5_years_controls(reset_test_data, last_years_controls):

    now = pytz.utc.localize(datetime.utcnow())
    five_years = timedelta(days=5 * 366)

    controls = extract_last_years_controls.run(years=5)

    pd.testing.assert_frame_equal(
        controls.drop(columns=["control_datetime_utc"])
        .sort_values("id")
        .reset_index(drop=True),
        last_years_controls.drop(columns=["control_datetime_utc"]),
    )

    assert ((now - controls.control_datetime_utc) < five_years).all()


def test_extract_fishing_infraction_natinfs(reset_test_data, infraction_natinf_codes):
    natinfs = extract_fishing_infraction_natinfs.run()
    assert natinfs == infraction_natinf_codes


def test_extract_vessels_most_recent_control(
    reset_test_data, vessels_most_recent_control
):
    df = extract_vessels_most_recent_control.run(years=5)
    pd.testing.assert_frame_equal(df, vessels_most_recent_control)


def test_transform_vessels_most_recent_control(
    vessels_most_recent_control, transformed_vessels_most_recent_control
):
    controls = transform_vessels_most_recent_control.run(vessels_most_recent_control)
    pd.testing.assert_frame_equal(controls, transformed_vessels_most_recent_control)


def test_compute_control_rate_risk_factors(
    last_years_controls, control_rate_risk_factors
):

    with patch(
        "src.pipeline.flows.control_anteriority.datetime",
        mock_datetime_utcnow(datetime(2023, 12, 31)),
    ):
        res = compute_control_rate_risk_factors.run(last_years_controls)

    pd.testing.assert_frame_equal(
        res.drop(columns=["last_control_datetime_utc"]), control_rate_risk_factors
    )


def test_compute_infraction_rate_risk_factors(
    last_years_controls, infraction_natinf_codes, infraction_rate_risk_factors
):
    res = compute_infraction_rate_risk_factors.run(
        last_years_controls, fishing_infraction_natinfs=infraction_natinf_codes
    )
    pd.testing.assert_frame_equal(
        res.astype({"infraction_rate_risk_factor": int}), infraction_rate_risk_factors
    )


def test_test_compute_control_statistics(last_years_controls, control_statistics):
    with patch(
        "src.pipeline.flows.control_anteriority.datetime",
        mock_datetime_utcnow(datetime(2023, 12, 31)),
    ):
        stats = compute_control_statistics.run(last_years_controls)

    pd.testing.assert_frame_equal(stats, control_statistics)


def test_control_anteriority_flow(reset_test_data, loaded_control_anteriority):

    query = "SELECT * FROM control_anteriority ORDER BY vessel_id"

    # Run control anteriority flow
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check that control anteriority data was correctly computed and loaded to
    # control_anteriority table

    control_anteriority = read_query(query, db="monitorfish_remote")

    max_seconds_of_difference_allowed = 10.0

    seconds_of_difference = (
        (
            control_anteriority.last_control_datetime_utc
            - loaded_control_anteriority.last_control_datetime_utc
        )
        .map(lambda td: td.total_seconds())
        .abs()
    )

    assert (seconds_of_difference < max_seconds_of_difference_allowed).all()

    # The value of number_recent_controls may change slightly depending the date, due
    # to the changing duration of years (regular vs leap years), so we need to make an
    # approximate check for this value as well.

    assert (
        (
            control_anteriority.number_recent_controls
            - loaded_control_anteriority.number_recent_controls
        ).abs()
        < 0.1
    ).all()
