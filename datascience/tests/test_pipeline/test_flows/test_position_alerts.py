from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
import pytz
from geoalchemy2 import Geometry
from sqlalchemy import BOOLEAN, TIMESTAMP, VARCHAR, Column, Integer, MetaData, Table

from src.pipeline.flows.position_alerts import (
    ZonesTable,
    alert_has_gear_parameters,
    extract_current_gears,
    filter_on_gears,
    flow,
    get_alert_type_zones_table,
    get_fishing_gears_table,
    make_alerts,
    make_fishing_gears_query,
    make_positions_in_alert_query,
)
from src.read_query import read_query
from tests.mocks import mock_datetime_utcnow


def test_zones_table():
    meta = MetaData()
    table = Table(
        "test_table",
        meta,
        Column("id", Integer),
        Column("some_text", VARCHAR),
        Column("geometry", Geometry),
    )

    zones_table = ZonesTable(
        table=table, geometry_column="geometry", filter_column="id"
    )
    assert zones_table.table is table
    assert zones_table.filter_column == "id"
    assert zones_table.geometry_column == "geometry"

    with pytest.raises(AssertionError):
        ZonesTable(table=table, geometry_column="some_text", filter_column="id")

    with pytest.raises(AssertionError):
        ZonesTable(
            table=table, geometry_column="geometry", filter_column="id_not_exists"
        )

    with pytest.raises(AssertionError):
        ZonesTable(
            table=table, geometry_column="geometry_not_exists", filter_column="id"
        )


def test_alert_has_gear_parameters_returns_true_on_non_null_inputs():
    assert alert_has_gear_parameters.run(["OTM"], ["Chaluts"])
    assert alert_has_gear_parameters.run(["OTB"], ["Chaluts", "Filets"])
    assert alert_has_gear_parameters.run(["OTT"], None)
    assert alert_has_gear_parameters.run(None, ["Chaluts"])


def test_alert_has_gear_parameters_returns_false_on_null_inputs():
    assert not alert_has_gear_parameters.run(None, None)


def test_alert_has_gear_parameters_raises_type_error_on_incorrect_input():
    with pytest.raises(TypeError):
        alert_has_gear_parameters.run(["OTM"], "not a list")
    with pytest.raises(TypeError):
        alert_has_gear_parameters.run(None, "not a list")
    with pytest.raises(TypeError):
        alert_has_gear_parameters.run("not_a_list", None)
    with pytest.raises(TypeError):
        alert_has_gear_parameters.run("unexpected string type", ["OTB"])


def test_get_alert_type_zones_table(reset_test_data):
    with pytest.raises(ValueError):
        get_alert_type_zones_table.run("Some unknown alert type")

    zones_tables = get_alert_type_zones_table.run("THREE_MILES_TRAWLING_ALERT")
    assert isinstance(zones_tables, ZonesTable)


def test_get_fishing_gears_table(reset_test_data):
    fishing_gears_table = get_fishing_gears_table.run()
    assert isinstance(fishing_gears_table, Table)


@patch(
    "src.pipeline.flows.position_alerts.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 16, 10, 0)),
)
def test_make_positions_in_alert_query():

    meta = MetaData()
    positions_table = Table(
        "positions",
        meta,
        Column("id", Integer),
        Column("internal_reference_number", VARCHAR),
        Column("external_reference_number", VARCHAR),
        Column("ircs", VARCHAR),
        Column("vessel_name", VARCHAR),
        Column("flag_state", VARCHAR),
        Column("date_time", TIMESTAMP),
        Column("is_fishing", BOOLEAN),
        Column("geometry", Geometry),
    )

    facades_table = Table(
        "facades", meta, Column("facade", VARCHAR), Column("geometry", Geometry)
    )

    zones_table = ZonesTable(
        Table(
            "zones",
            meta,
            Column("zone_name", VARCHAR),
            Column("geometry_col", Geometry),
        ),
        geometry_column="geometry_col",
        filter_column="zone_name",
    )

    # Test make_positions_in_alert_query with all arguments

    only_fishing_positions = True
    zones = ["Zone A"]
    hours_from_now = 6
    flag_states = ["NL, DE"]

    select_statement = make_positions_in_alert_query.run(
        positions_table,
        facades_table,
        zones_table,
        only_fishing_positions,
        zones,
        hours_from_now,
        flag_states,
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "positions.id, "
        "positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "facades.facade "
        "\nFROM positions "
        "JOIN zones "
        "ON ST_Intersects(positions.geometry, zones.geometry_col) "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "\nWHERE positions.date_time > '2021-01-01 10:10:00' "
        "AND positions.date_time < '2021-01-01 16:10:00' "
        "AND ("
        "positions.internal_reference_number IS NOT NULL OR "
        "positions.external_reference_number IS NOT NULL OR "
        "positions.ircs IS NOT NULL) "
        "AND positions.is_fishing "
        "AND zones.zone_name IN ('Zone A') "
        "AND positions.flag_state IN ('NL, DE')"
    )

    assert query == expected_query

    # Test make_positions_in_alert_query with required arguments only

    only_fishing_positions = False

    select_statement = make_positions_in_alert_query.run(
        positions_table,
        facades_table,
        zones_table,
        only_fishing_positions,
        hours_from_now=hours_from_now,
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "positions.id, "
        "positions.internal_reference_number AS cfr, "
        "positions.external_reference_number AS external_immatriculation, "
        "positions.ircs, "
        "positions.vessel_name, "
        "positions.flag_state, "
        "positions.date_time, "
        "facades.facade "
        "\nFROM positions "
        "JOIN zones "
        "ON ST_Intersects(positions.geometry, zones.geometry_col) "
        "LEFT OUTER JOIN facades "
        "ON ST_Intersects(positions.geometry, facades.geometry) "
        "\nWHERE positions.date_time > '2021-01-01 10:10:00' "
        "AND positions.date_time < '2021-01-01 16:10:00' "
        "AND ("
        "positions.internal_reference_number IS NOT NULL OR "
        "positions.external_reference_number IS NOT NULL OR "
        "positions.ircs IS NOT NULL)"
    )

    assert query == expected_query


def test_make_fishing_gears_query():
    meta = MetaData()
    fishing_gears_table = Table(
        "fishing_gear_codes",
        meta,
        Column("fishing_gear_code", VARCHAR),
        Column("fishing_gear_category", VARCHAR),
    )

    # Test with filter on gear codes

    select_statement = make_fishing_gears_query.run(
        fishing_gears_table, fishing_gears=["OTB", "OTM"], fishing_gear_categories=None
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "fishing_gear_codes.fishing_gear_code "
        "\nFROM fishing_gear_codes "
        "\nWHERE fishing_gear_codes.fishing_gear_code IN ('OTB', 'OTM')"
    )

    assert query == expected_query

    # Test with filter on gear categories

    select_statement = make_fishing_gears_query.run(
        fishing_gears_table, fishing_gears=None, fishing_gear_categories=["Chaluts"]
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT "
        "fishing_gear_codes.fishing_gear_code "
        "\nFROM fishing_gear_codes "
        "\nWHERE fishing_gear_codes.fishing_gear_category IN ('Chaluts')"
    )

    assert query == expected_query

    # Get all gear codes

    select_statement = make_fishing_gears_query.run(
        fishing_gears_table, fishing_gears=None, fishing_gear_categories=None
    )

    query = str(select_statement.compile(compile_kwargs={"literal_binds": True}))

    expected_query = (
        "SELECT " "fishing_gear_codes.fishing_gear_code " "\nFROM fishing_gear_codes"
    )

    assert query == expected_query


def test_extract_current_gears(reset_test_data):
    current_gears = extract_current_gears.run()
    nb_last_positions_vessels = read_query(
        "monitorfish_remote", "SELECT COUNT(*) FROM last_positions"
    ).iloc[0, 0]

    # extract_current_gears should yield gears of all vessels in the
    # `last_positions` table
    assert len(current_gears) == nb_last_positions_vessels

    # extract_current_gears should take gears in the `last_positions` table
    # when available

    assert current_gears.loc[current_gears.cfr == "ABC000542519", "current_gears"].iloc[
        0
    ] == {"OTM"}

    # extract_current_gears should take gears in the `vessels` table when not
    # available in the `last_positions` table
    assert current_gears.loc[current_gears.cfr == "ABC000055481", "current_gears"].iloc[
        0
    ] == {"OTT", "OTB", "OTM"}

    # extract_current_gears should return current_gears = `None` for vessels
    # whose gear is not in `vessels` nor in `last_positions`
    assert (
        current_gears.loc[
            current_gears.external_immatriculation == "SB125334",
            "current_gears",
        ].iloc[0]
        is None
    )


def test_filter_on_gears():
    positions_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "B", "C"],
            "external_immatriculation": ["AA", "BB", "CC"],
            "ircs": ["AAA", "BBB", "CCC"],
            "some_data": [1.23, 5.56, 12.23],
        }
    )
    current_gears = pd.DataFrame(
        {
            "cfr": ["A", "B", "C"],
            "external_immatriculation": ["AA", "BB", "CC"],
            "ircs": ["AAA", "BBB", "CCC"],
            "current_gears": [None, {"OTB", "OTT"}, {"DRB"}],
        }
    )
    gear_codes = {"OTM", "OTB"}

    # Test excluding unknown gears
    include_vessels_unknown_gear = False

    filtered_positions_in_alert = filter_on_gears.run(
        positions_in_alert,
        current_gears,
        gear_codes,
        include_vessels_unknown_gear,
    )

    pd.testing.assert_frame_equal(
        filtered_positions_in_alert,
        positions_in_alert.loc[positions_in_alert.cfr == "B"],
    )

    # Test including unknown gears
    include_vessels_unknown_gear = True

    filtered_positions_in_alert = filter_on_gears.run(
        positions_in_alert,
        current_gears,
        gear_codes,
        include_vessels_unknown_gear,
    )

    pd.testing.assert_frame_equal(
        filtered_positions_in_alert,
        positions_in_alert.loc[positions_in_alert.cfr.isin(["B", "A"])],
        check_like=True,
    )


def test_make_alerts():

    now = datetime(2020, 1, 1, 0, 0, 0)
    td = timedelta(hours=1)

    positions_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "A", "A", "B", "A", "B", "A"],
            "external_immatriculation": ["AA", "AA", "AA", "BB", "AA", "BB", "AA"],
            "ircs": ["AAA", "AAA", "AAA", "BBB", "AAA", "BBB", "AAA"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER"] * 7,
            "vessel_name": ["v_A", "v_A", "v_A", "v_B", "v_A", "v_B", "v_A"],
            "flag_state": ["FR", "FR", "FR", "FR", "FR", "FR", "FR"],
            "facade": ["NAMO", "NAMO", "NAMO", "MEMN", "NAMO", "MEMN", "NAMO"],
            "risk_factor": [1.23, 1.23, 1.23, None, 1.23, None, 1.23],
            "date_time": [
                now - 4 * td,
                now - 3 * td,
                now - 2 * td,
                now - 1.5 * td,
                now - td,
                now - 0.5 * td,
                now,
            ],
        }
    )

    alert_type = "USER_DEFINED_ALERT_TYPE"

    alerts = make_alerts.run(positions_in_alert, alert_type=alert_type)

    expected_alerts = pd.DataFrame(
        {
            "vessel_name": ["v_A", "v_B"],
            "internal_reference_number": ["A", "B"],
            "external_reference_number": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now, now - 0.5 * td],
            "value": [
                {
                    "seaFront": "NAMO",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": 1.23,
                },
                {
                    "seaFront": "MEMN",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": None,
                },
            ],
        }
    )

    pd.testing.assert_frame_equal(alerts, expected_alerts)


def test_flow_deletes_existing_pending_alerts(reset_test_data):

    flow.schedule = None

    # With these parameters, no alert should be raised.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    zones = "0-3"
    hours_from_now = 8
    only_fishing_positions = True
    flag_states = None
    fishing_gears = ["OTM"]
    fishing_gear_categories = None
    include_vessels_unknown_gear = False

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query(
        "monitorfish_remote", "SELECT COUNT(*) FROM pending_alerts"
    )

    assert pending_alerts.iloc[0, 0] == 0


def test_flow_inserts_new_pending_alerts(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    flow.schedule = None

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = None
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("monitorfish_remote", "SELECT * FROM pending_alerts")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000306959",
                "ABC000542519",
            ],
            "external_reference_number": [
                "AS761555",
                "RV348407",
                "RO237719",
            ],
            "ircs": [
                "IL2468",
                "LLUK",
                "FQ7058",
            ],
            "creation_date": [
                now - timedelta(days=1),
                now - timedelta(minutes=10),
                now - timedelta(minutes=25),
            ],
            "trip_number": [None, None, None],
            "value": [
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "flagState": "NL",
                    "riskFactor": None,
                },
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "Facade B",
                    "flagState": "FR",
                    "riskFactor": 2.14443662414848,
                },
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "Facade A",
                    "flagState": "FR",
                    "riskFactor": 2.09885592141872,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.drop(columns=["creation_date", "id"]),
        expected_pending_alerts.drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (pending_alerts.creation_date - expected_pending_alerts.creation_date).map(
                lambda td: td.total_seconds()
            )
        )
        < 10
    ).all()


def test_flow_filters_on_gears(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    flow.schedule = None

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = None
    fishing_gears = ["OTM"]
    fishing_gear_categories = None
    include_vessels_unknown_gear = False

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("monitorfish_remote", "SELECT * FROM pending_alerts")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000542519",
            ],
            "external_reference_number": [
                "AS761555",
                "RO237719",
            ],
            "ircs": [
                "IL2468",
                "FQ7058",
            ],
            "creation_date": [
                now - timedelta(days=1),
                now - timedelta(minutes=25),
            ],
            "trip_number": [None, None],
            "value": [
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "flagState": "NL",
                    "riskFactor": None,
                },
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "Facade A",
                    "flagState": "FR",
                    "riskFactor": 2.09885592141872,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.drop(columns=["creation_date", "id"]),
        expected_pending_alerts.drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (pending_alerts.creation_date - expected_pending_alerts.creation_date).map(
                lambda td: td.total_seconds()
            )
        )
        < 10
    ).all()


def test_flow_filters_on_time(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    flow.schedule = None

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    zones = ["0-3", "3-6"]
    hours_from_now = 8
    only_fishing_positions = False
    flag_states = None
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("monitorfish_remote", "SELECT * FROM pending_alerts")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
            ],
            "internal_reference_number": [
                "ABC000306959",
                "ABC000542519",
            ],
            "external_reference_number": [
                "RV348407",
                "RO237719",
            ],
            "ircs": [
                "LLUK",
                "FQ7058",
            ],
            "creation_date": [
                now - timedelta(minutes=10),
                now - timedelta(minutes=25),
            ],
            "trip_number": [None, None],
            "value": [
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "Facade B",
                    "flagState": "FR",
                    "riskFactor": 2.14443662414848,
                },
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "Facade A",
                    "flagState": "FR",
                    "riskFactor": 2.09885592141872,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.drop(columns=["creation_date", "id"]),
        expected_pending_alerts.drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (pending_alerts.creation_date - expected_pending_alerts.creation_date).map(
                lambda td: td.total_seconds()
            )
        )
        < 10
    ).all()


def test_flow_filters_on_flag_states(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    flow.schedule = None

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = ["NL"]
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("monitorfish_remote", "SELECT * FROM pending_alerts")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
            ],
            "internal_reference_number": [
                "ABC000055481",
            ],
            "external_reference_number": [
                "AS761555",
            ],
            "ircs": [
                "IL2468",
            ],
            "creation_date": [
                now - timedelta(days=1),
            ],
            "trip_number": [None],
            "value": [
                {
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "flagState": "NL",
                    "riskFactor": None,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.drop(columns=["creation_date", "id"]),
        expected_pending_alerts.drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (pending_alerts.creation_date - expected_pending_alerts.creation_date).map(
                lambda td: td.total_seconds()
            )
        )
        < 10
    ).all()
