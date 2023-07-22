from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
from geoalchemy2 import Geometry
from prefect.engine.signals import TRIGGERFAIL
from sqlalchemy import BOOLEAN, FLOAT, TIMESTAMP, VARCHAR, Column, MetaData, Table

from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.flows.missing_far_alerts import (
    concat,
    extract_vessels_that_emitted_fars,
    flow,
    get_dates,
    get_vessels_at_sea,
    get_vessels_with_missing_fars,
    make_positions_at_sea_query,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_datetime_utcnow

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def positions_at_sea():
    d = datetime(2020, 2, 5, 12, 56, 0)
    td = timedelta(hours=1)

    return pd.DataFrame(
        {
            "cfr": ["A", "A", "A", "A", "A", "A", "A", "B"],
            "external_immatriculation": [
                "AA",
                "AA",
                "AA",
                "AA",
                "AA",
                "AA",
                "AA",
                "BB",
            ],
            "ircs": ["AAA", "AAA", "AAA", "AAA", "AAA", "AAA", "AAA", "BBB"],
            "vessel_name": [
                "vessel_A",
                "vessel_A",
                "vessel_A",
                "vessel_A",
                "vessel_A",
                "vessel_A",
                "vessel_A",
                "vessel_B",
            ],
            "flag_state": [
                "state_A",
                "state_A",
                "state_A",
                "state_A",
                "state_A",
                "state_A",
                "state_A",
                "state_B",
            ],
            "date_time": [
                d,
                d + td,
                d + 2 * td,
                d + 36 * td,
                d + 24 * td,
                d + 48 * td,
                d + 46 * td,
                d,
            ],
            "facade": [
                "facade_A",
                "facade_A",
                "facade_A",
                "facade_A",
                "facade_A",
                "facade_A",
                "facade_A",
                "facade_B",
            ],
            "latitude": [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, -5.65],
            "longitude": [10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, -8.96],
        }
    )


@patch(
    "src.pipeline.flows.missing_far_alerts.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 16, 10, 0)),
)
def test_get_dates():
    (
        period_start_at_zero_hours,
        yesterday_at_eight_pm,
        today_at_zero_hours,
        utcnow,
    ) = get_dates.run(days_without_far=1)
    assert period_start_at_zero_hours == datetime(2020, 12, 31, 0, 0, 0)
    assert yesterday_at_eight_pm == datetime(2020, 12, 31, 20, 0, 0)
    assert today_at_zero_hours == datetime(2021, 1, 1, 0, 0, 0)
    assert utcnow == datetime(2021, 1, 1, 16, 10, 0)

    (
        period_start_at_zero_hours,
        yesterday_at_eight_pm,
        today_at_zero_hours,
        utcnow,
    ) = get_dates.run(days_without_far=2)
    assert period_start_at_zero_hours == datetime(2020, 12, 30, 0, 0, 0)
    assert yesterday_at_eight_pm == datetime(2020, 12, 31, 20, 0, 0)
    assert today_at_zero_hours == datetime(2021, 1, 1, 0, 0, 0)
    assert utcnow == datetime(2021, 1, 1, 16, 10, 0)


def test_make_positions_at_sea_query():

    # Setup

    from_date = datetime(2020, 12, 4, 12, 23, 0)
    to_date = datetime(2020, 12, 5, 12, 23, 0)

    meta = MetaData()

    facade_areas_table = Table(
        "facades", meta, Column("facade", VARCHAR), Column("geometry", Geometry)
    )

    positions_table = Table(
        "positions",
        meta,
        Column("internal_reference_number", VARCHAR),
        Column("external_reference_number", VARCHAR),
        Column("ircs", VARCHAR),
        Column("vessel_name", VARCHAR),
        Column("flag_state", VARCHAR),
        Column("date_time", TIMESTAMP),
        Column("latitude", FLOAT),
        Column("longitude", FLOAT),
        Column("is_at_port", BOOLEAN),
        Column("is_fishing", BOOLEAN),
        Column("geometry", Geometry),
    )

    vessels_table = Table(
        "vessels", meta, Column("cfr", VARCHAR), Column("length", FLOAT)
    )

    eez_areas_table = Table(
        "eez_areas", meta, Column("wkb_geometry", Geometry), Column("iso_sov1", VARCHAR)
    )

    # Test with all arguments

    query = make_positions_at_sea_query.run(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=from_date,
        to_date=to_date,
        states_to_monitor_iso2=["ES"],
        vessels_table=vessels_table,
        minimum_length=12.0,
        eez_areas_table=eez_areas_table,
        eez_to_monitor_iso3=["FRA"],
        only_fishing_positions=True,
    )

    query_string = str(query.compile(compile_kwargs={"literal_binds": True}))
    expected_query_string = (
        "SELECT "
        "positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "positions.latitude, "
        "positions.longitude, "
        "facades.facade "
        "\nFROM positions "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "JOIN vessels "
        "ON positions.internal_reference_number = vessels.cfr "
        "JOIN eez_areas "
        "ON ST_Intersects(positions.geometry, eez_areas.wkb_geometry) "
        "\nWHERE "
        "positions.date_time >= '2020-12-04 12:23:00' AND "
        "positions.date_time < '2020-12-05 12:23:00' AND "
        "positions.internal_reference_number IS NOT NULL AND "
        "NOT positions.is_at_port AND "
        "positions.is_fishing AND "
        "positions.flag_state IN ('ES') AND "
        "(vessels.length >= 12.0 OR positions.flag_state != 'FR') AND "
        "eez_areas.iso_sov1 IN ('FRA')"
    )

    assert query_string == expected_query_string

    # Test without optional arguments

    query = make_positions_at_sea_query.run(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=from_date,
        to_date=to_date,
    )

    query_string = str(query.compile(compile_kwargs={"literal_binds": True}))
    expected_query_string = (
        "SELECT "
        "positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "positions.latitude, "
        "positions.longitude, "
        "facades.facade "
        "\nFROM positions "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "\nWHERE "
        "positions.date_time >= '2020-12-04 12:23:00' AND "
        "positions.date_time < '2020-12-05 12:23:00' AND "
        "positions.internal_reference_number IS NOT NULL AND "
        "NOT positions.is_at_port"
    )

    assert query_string == expected_query_string


def test_extract_vessels_that_emitted_fars(reset_test_data):

    now = datetime.utcnow()

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars.run(
        declaration_min_datetime_utc=now - timedelta(days=2),
        declaration_max_datetime_utc=now - timedelta(days=1),
        fishing_operation_min_datetime_utc=datetime(year=2018, month=7, day=21),
        fishing_operation_max_datetime_utc=datetime(year=2018, month=7, day=22),
    )
    assert vessels_that_emitted_fars == {"ABC000306959"}

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars.run(
        declaration_min_datetime_utc=now - timedelta(days=2),
        declaration_max_datetime_utc=now - timedelta(days=1),
        fishing_operation_min_datetime_utc=datetime(year=2015, month=7, day=21),
        fishing_operation_max_datetime_utc=datetime(year=2015, month=7, day=22),
    )
    assert vessels_that_emitted_fars == set()

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars.run(
        declaration_min_datetime_utc=now - timedelta(days=5),
        declaration_max_datetime_utc=now - timedelta(days=4),
        fishing_operation_min_datetime_utc=datetime(year=2018, month=7, day=21),
        fishing_operation_max_datetime_utc=datetime(year=2018, month=7, day=22),
    )
    assert vessels_that_emitted_fars == set()

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars.run(
        declaration_min_datetime_utc=now - timedelta(weeks=2),
        declaration_max_datetime_utc=now - timedelta(days=1),
        fishing_operation_min_datetime_utc=datetime(year=2018, month=7, day=21),
        fishing_operation_max_datetime_utc=datetime(year=2018, month=7, day=22),
    )

    assert vessels_that_emitted_fars == {"ABC000306959", "ABC000542519"}


def test_get_vessels_at_sea(positions_at_sea):
    vessels_at_sea_1_day = get_vessels_at_sea.run(positions_at_sea, min_days=1)
    expected_vessels_at_sea_1_day = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "external_immatriculation": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_name": ["vessel_A", "vessel_B"],
            "flag_state": ["state_A", "state_B"],
            "facade": ["facade_A", "facade_B"],
            "latitude": [1.5, -5.65],
            "longitude": [10.6, -8.96],
        }
    )
    pd.testing.assert_frame_equal(vessels_at_sea_1_day, expected_vessels_at_sea_1_day)

    vessels_at_sea_2_days = get_vessels_at_sea.run(positions_at_sea, min_days=2)
    vessels_at_sea_3_days = get_vessels_at_sea.run(positions_at_sea, min_days=3)
    expected_vessels_at_sea_2_or_3_days = pd.DataFrame(
        {
            "cfr": ["A"],
            "external_immatriculation": ["AA"],
            "ircs": ["AAA"],
            "vessel_name": ["vessel_A"],
            "flag_state": ["state_A"],
            "facade": ["facade_A"],
            "latitude": [1.5],
            "longitude": [10.6],
        }
    )
    pd.testing.assert_frame_equal(
        vessels_at_sea_2_days, expected_vessels_at_sea_2_or_3_days
    )
    pd.testing.assert_frame_equal(
        vessels_at_sea_3_days, expected_vessels_at_sea_2_or_3_days
    )

    vessels_at_sea_4_days = get_vessels_at_sea.run(positions_at_sea, min_days=4)
    assert len(vessels_at_sea_4_days) == 0


def test_concat():
    df1 = pd.DataFrame(
        {
            "cfr": ["A", "A", "A"],
            "external_immatriculation": ["AA", "AA", "AA"],
            "ircs": ["AAA", "AAA", "AAA"],
            "vessel_name": ["Vessel_A", "Vessel_A", "Vessel_A"],
            "flag_state": ["FR", "FR", "FR"],
            "facade": ["NAMO", "NAMO", "NAMO"],
            "positions_data": [1, 2, 4],
        }
    )

    df2 = pd.DataFrame(
        {
            "cfr": ["B"],
            "external_immatriculation": ["BB"],
            "ircs": ["BBB"],
            "vessel_name": ["Vessel_B"],
            "flag_state": ["BE"],
            "facade": ["MEMN"],
            "positions_data": [15],
        }
    )

    expected_res = pd.DataFrame(
        {
            "cfr": ["A", "A", "A", "B"],
            "external_immatriculation": ["AA", "AA", "AA", "BB"],
            "ircs": ["AAA", "AAA", "AAA", "BBB"],
            "vessel_name": ["Vessel_A", "Vessel_A", "Vessel_A", "Vessel_B"],
            "flag_state": ["FR", "FR", "FR", "BE"],
            "facade": ["NAMO", "NAMO", "NAMO", "MEMN"],
            "positions_data": [1, 2, 4, 15],
        }
    )

    res = concat.run(df1, df2)

    pd.testing.assert_frame_equal(res, expected_res)


def test_get_vessels_with_missing_fars():
    vessels_at_sea = pd.DataFrame(
        {
            "cfr": ["Vessel_1", "Vessel_3", "Vessel 4", "Vessel 5"],
            "facade": ["NAMO", "MEMN", "SA", "MED"],
            "other_data": ["what", "ever", "you", "say"],
        }
    )
    vessels_that_emitted_fars = {"Vessel_1", "Vessel_2", "Vessel 4", "Vessel 5"}
    vessels_with_missing_fars = get_vessels_with_missing_fars.run(
        vessels_at_sea=vessels_at_sea,
        vessels_that_emitted_fars=vessels_that_emitted_fars,
    )

    expected_vessels_with_missing_fars = pd.DataFrame(
        {
            "cfr": ["Vessel_3"],
            "facade": ["MEMN"],
            "other_data": ["ever"],
        }
    )

    pd.testing.assert_frame_equal(
        vessels_with_missing_fars, expected_vessels_with_missing_fars
    )


def test_get_vessels_with_missing_fars_raises_if_share_is_exceeded():
    vessels_at_sea = pd.DataFrame(
        {
            "cfr": ["Vessel_1", "Vessel_3", "Vessel 4", "Vessel 5"],
            "facade": ["NAMO", "MEMN", "SA", "MED"],
            "other_data": ["what", "ever", "you", "say"],
        }
    )
    vessels_that_emitted_fars = {"Vessel_1", "Vessel_2", "Vessel 4", "Vessel 5"}

    with pytest.raises(MonitorfishHealthError):
        get_vessels_with_missing_fars.run(
            vessels_at_sea=vessels_at_sea,
            vessels_that_emitted_fars=vessels_that_emitted_fars,
            max_share_of_vessels_with_missing_fars=0.2,
        )


def test_flow_when_an_alert_is_silenced(reset_test_data):

    initial_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )

    flow.schedule = None
    state = flow.run(
        alert_type="MISSING_FAR_ALERT",
        alert_config_name="MISSING_FAR_ALERT",
        states_iso2_to_monitor_everywhere=["FR", "NL"],
        states_iso2_to_monitor_in_french_eez=["ES", "DE"],
        max_share_of_vessels_with_missing_fars=1.0,
        minimum_length=12.0,
        only_raise_if_route_shows_fishing=True,
        days_without_far=1,
    )

    assert state.is_successful()

    final_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )

    assert len(initial_pending_alerts) == 1
    # Only one alert alert (out of the two) is kept, as one alert is filtered by the
    # filter_silenced_alerts task
    assert len(state.result[flow.get_tasks("make_alerts")[0]].result) == 2
    filtered_alerts = state.result[flow.get_tasks("filter_silenced_alerts")[0]].result
    expected_filtered_alerts = pd.DataFrame(
        {
            "vessel_name": ["PLACE SPECTACLE SUBIR"],
            "internal_reference_number": ["ABC000055481"],
            "external_reference_number": ["AS761555"],
            "ircs": ["IL2468"],
            "flag_state": ["NL"],
            "vessel_id": [3],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER"],
            "latitude": 53.424,
            "longitude": 5.549,
            "value": [
                {
                    "seaFront": None,
                    "type": "MISSING_FAR_ALERT",
                    "riskFactor": 1.7411011266,
                    "dml": "DML 29",
                }
            ],
            "alert_config_name": ["MISSING_FAR_ALERT"],
        }
    )

    pd.testing.assert_frame_equal(
        filtered_alerts.drop(columns=["creation_date"]),
        expected_filtered_alerts,
        check_dtype=False,
    )

    assert len(final_pending_alerts) == 2


def test_flow_fails_if_share_of_vessels_with_missing_far_is_too_large(reset_test_data):

    max_share_of_vessels_with_missing_fars = 0.23

    flow.schedule = None
    state = flow.run(
        alert_type="MISSING_FAR_ALERT",
        alert_config_name="MISSING_FAR_ALERT",
        states_iso2_to_monitor_everywhere=["FR", "NL"],
        states_iso2_to_monitor_in_french_eez=["ES", "DE"],
        max_share_of_vessels_with_missing_fars=max_share_of_vessels_with_missing_fars,
        minimum_length=12.0,
        only_raise_if_route_shows_fishing=True,
        days_without_far=1,
    )

    assert not state.is_successful()
    vessels_with_missing_fars = state.result[
        flow.get_tasks("get_vessels_with_missing_fars")[0]
    ].result
    assert isinstance(vessels_with_missing_fars, MonitorfishHealthError)
    assert str(vessels_with_missing_fars) == (
        "More than 23% of the `vessels_at_sea` are absent from "
        "`vessels_that_emitted_fars`. It is likely that there is a logbook data "
        "breakdown."
    )

    load_alerts_result = state.result[flow.get_tasks("load_alerts")[0]].result
    assert isinstance(load_alerts_result, TRIGGERFAIL)
