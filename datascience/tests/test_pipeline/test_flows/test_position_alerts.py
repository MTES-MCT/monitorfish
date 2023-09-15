from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
import pytz
from geoalchemy2 import Geometry
from sqlalchemy import (
    BOOLEAN,
    FLOAT,
    TIMESTAMP,
    VARCHAR,
    Column,
    Integer,
    MetaData,
    Table,
)

from src.db_config import create_engine
from src.pipeline.flows.position_alerts import (
    ZonesTable,
    alert_has_gear_parameters,
    extract_current_gears,
    filter_on_gears,
    flow,
    get_alert_type_zones_table,
    get_vessels_in_alert,
    make_fishing_gears_query,
    make_positions_in_alert_query,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_datetime_utcnow

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


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
        Column("latitude", FLOAT),
        Column("longitude", FLOAT),
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
    except_flag_states = ["VE"]

    select_statement = make_positions_in_alert_query.run(
        positions_table=positions_table,
        facades_table=facades_table,
        zones_table=zones_table,
        only_fishing_positions=only_fishing_positions,
        zones=zones,
        hours_from_now=hours_from_now,
        flag_states=flag_states,
        except_flag_states=except_flag_states,
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
        "positions.latitude, "
        "positions.longitude, "
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
        "AND positions.flag_state IN ('NL, DE') "
        "AND positions.flag_state NOT IN ('VE')"
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
        "positions.latitude, "
        "positions.longitude, "
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
        "SELECT COUNT(*) FROM last_positions", db="monitorfish_remote"
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
            "cfr": ["A", "B", "C", "D"],
            "external_immatriculation": ["AA", "BB", "CC", "DD"],
            "ircs": ["AAA", "BBB", "CCC", "DDD"],
            "some_data": [1.23, 5.56, 12.23, 5.236],
        }
    )
    current_gears = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "external_immatriculation": ["AA", "BB", "CC", "DD"],
            "ircs": ["AAA", "BBB", "CCC", "DDD"],
            "current_gears": [None, {"OTB", "OTT"}, {"DRB"}, {"OTM"}],
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
        positions_in_alert.loc[positions_in_alert.cfr == "D"],
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
        positions_in_alert.loc[positions_in_alert.cfr.isin(["D", "A"])],
        check_like=True,
    )


def test_get_vessels_in_alert():

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
            "latitude": [-5.23, -4.23, -3.23, -50.23, -2.23, -51.23, -1.23],
            "longitude": [43.25, 42.25, 41.25, -43.25, 40.25, -42.25, 39.25],
        }
    )

    vessels_in_alert = get_vessels_in_alert.run(positions_in_alert)

    expected_vessels_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "external_immatriculation": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_name": ["v_A", "v_B"],
            "flag_state": ["FR", "FR"],
            "facade": ["NAMO", "MEMN"],
            "risk_factor": [1.23, None],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now, now - 0.5 * td],
            "latitude": [-1.23, -51.23],
            "longitude": [39.25, -42.25],
        }
    )
    pd.testing.assert_frame_equal(vessels_in_alert, expected_vessels_in_alert)


def test_flow_deletes_existing_pending_alerts_of_matching_config_name(reset_test_data):

    # With these parameters, no alert should be raised.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name_in_table = "ALERTE_1"
    alert_config_name_not_in_table = "ALERTE_2"
    zones = "0-3"
    hours_from_now = 8
    only_fishing_positions = True
    flag_states = None
    fishing_gears = ["OTM"]
    fishing_gear_categories = None
    include_vessels_unknown_gear = False

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        alert_config_name=alert_config_name_not_in_table,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query(
        "SELECT COUNT(*) FROM pending_alerts", db="monitorfish_remote"
    )

    # The alert in the table should still be there
    assert pending_alerts.iloc[0, 0] == 1

    state = flow.run(
        alert_type=alert_type,
        zones=zones,
        alert_config_name=alert_config_name_in_table,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query(
        "SELECT COUNT(*) FROM pending_alerts",
        db="monitorfish_remote",
    )

    # The alert in the table should be removed
    assert pending_alerts.iloc[0, 0] == 0


def test_flow_inserts_new_pending_alerts(reset_test_data):
    # We delete the silenced alerts first
    e = create_engine("monitorfish_remote")
    e.execute("DELETE FROM silenced_alerts;")

    now = pytz.utc.localize(datetime.utcnow())

    # With these parameters, all 5 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name = "ALERTE_1"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = None
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
                "MYNAMEIS",
                "I DO 4H REPORT",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000306959",
                "ABC000542519",
                "ABC000658985",
                None,
            ],
            "external_reference_number": [
                "AS761555",
                "RV348407",
                "RO237719",
                "OHMYGOSH",
                "ZZTOPACDC",
            ],
            "ircs": [
                "IL2468",
                "LLUK",
                "FQ7058",
                "OGMJ",
                "ZZ000000",
            ],
            "creation_date": [
                now - timedelta(days=1),
                now - timedelta(minutes=10),
                now - timedelta(minutes=25),
                now - timedelta(minutes=15),
                now - timedelta(minutes=10),
            ],
            "trip_number": [None, None, None, None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
                {
                    "dml": None,
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 13",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.7411011266,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
            ],
            "alert_config_name": [alert_config_name] * 5,
            "vessel_id": [3, 1, 2, None, 6],
            "latitude": [53.435, 49.610, 43.324, 49.606, 43.324],
            "longitude": [5.553, -0.740, 5.359, -0.736, 5.359],
            "flag_state": [
                "NL",
                "FR",
                "FR",
                "FR",
                "FR",
            ],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_inserts_new_pending_alerts_without_silenced_alerts(reset_test_data):
    now = pytz.utc.localize(datetime.utcnow())

    # With these parameters, all 5 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name = "ALERTE_1"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = None
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "PLACE SPECTACLE SUBIR",
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
                "I DO 4H REPORT",
            ],
            "internal_reference_number": [
                "ABC000055481",
                "ABC000306959",
                "ABC000542519",
                None,
            ],
            "external_reference_number": [
                "AS761555",
                "RV348407",
                "RO237719",
                "ZZTOPACDC",
            ],
            "ircs": [
                "IL2468",
                "LLUK",
                "FQ7058",
                "ZZ000000",
            ],
            "creation_date": [
                now - timedelta(days=1),
                now - timedelta(minutes=10),
                now - timedelta(minutes=25),
                now - timedelta(minutes=10),
            ],
            "trip_number": [None, None, None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
                {
                    "dml": "DML 13",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.7411011266,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
            ],
            "alert_config_name": [alert_config_name] * 4,
            "vessel_id": [3, 1, 2, 6],
            "latitude": [53.435, 49.610, 43.324, 43.324],
            "longitude": [5.553, -0.740, 5.359, 5.359],
            "flag_state": ["NL", "FR", "FR", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_gears(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name = "ALERTE_1"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = None
    fishing_gears = ["OTM", "OTB", "OTT"]
    fishing_gear_categories = None
    include_vessels_unknown_gear = False

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

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
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name] * 2,
            "vessel_id": [3, 2],
            "latitude": [53.435, 43.324],
            "longitude": [5.553, 5.359],
            "flag_state": ["NL", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_time(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name = "ALERTE_1"
    zones = ["0-3", "3-6"]
    hours_from_now = 8
    only_fishing_positions = False
    flag_states = None
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "ÉTABLIR IMPRESSION LORSQUE",
                "DEVINER FIGURE CONSCIENCE",
                "I DO 4H REPORT",
            ],
            "internal_reference_number": [
                "ABC000306959",
                "ABC000542519",
                None,
            ],
            "external_reference_number": [
                "RV348407",
                "RO237719",
                "ZZTOPACDC",
            ],
            "ircs": [
                "LLUK",
                "FQ7058",
                "ZZ000000",
            ],
            "creation_date": [
                now - timedelta(minutes=10),
                now - timedelta(minutes=25),
                now - timedelta(minutes=10),
            ],
            "trip_number": [None, None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "SA",
                    "riskFactor": None,
                },
                {
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.41421356237310003,
                },
                {
                    "dml": "DML 13",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.7411011266,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
            ],
            "alert_config_name": [alert_config_name] * 3,
            "vessel_id": [1, 2, 6],
            "latitude": [49.610, 43.324, 43.324],
            "longitude": [-0.740, 5.359, 5.359],
            "flag_state": ["FR", "FR", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_filters_on_flag_states(reset_test_data):

    now = pytz.utc.localize(datetime.utcnow())

    # With these parameters, all 3 vessels should be in alert.
    alert_type = "THREE_MILES_TRAWLING_ALERT"
    alert_config_name = "ALERTE_1"
    zones = ["0-3", "3-6"]
    hours_from_now = 48
    only_fishing_positions = False
    flag_states = ["NL"]
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        only_fishing_positions=only_fishing_positions,
        flag_states=flag_states,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

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
                    "dml": "DML 29",
                    "type": "THREE_MILES_TRAWLING_ALERT",
                    "seaFront": None,
                    "riskFactor": 1.74110112659225003,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "alert_config_name": [alert_config_name],
            "vessel_id": [3],
            "latitude": [53.435],
            "longitude": [5.553],
            "flag_state": ["NL"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date"]),
    )

    # Dates inserted in the database test data by `CURRENT_TIMESTAMP` cannot be mocked
    # and are not exactly equal to `datetime.utcnow()` above, so we need to make an
    # 'almost equal' check.
    assert (
        (
            (
                pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
                - expected_pending_alerts.sort_values("vessel_id")
                .reset_index(drop=True)
                .creation_date
            ).map(lambda td: td.total_seconds())
        )
        < 10
    ).all()


def test_flow_french_eez_fishing_alert(reset_test_data):

    # With these parameters, 2 french vessels should be in alert.
    alert_type = "FRENCH_EEZ_FISHING_ALERT"
    alert_config_name = "ALERTE_1"
    alert_config_name = "ALERTE_1"
    zones = ["FRA"]
    hours_from_now = 8
    only_fishing_positions = False
    fishing_gears = None
    fishing_gear_categories = None
    include_vessels_unknown_gear = True
    except_flag_states = ["NL"]

    flow.schedule = None
    state = flow.run(
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        zones=zones,
        hours_from_now=hours_from_now,
        fishing_gears=fishing_gears,
        fishing_gear_categories=fishing_gear_categories,
        include_vessels_unknown_gear=include_vessels_unknown_gear,
        only_fishing_positions=only_fishing_positions,
        except_flag_states=except_flag_states,
    )

    assert state.is_successful()

    pending_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    expected_pending_alerts = pd.DataFrame(
        {
            "vessel_name": [
                "DEVINER FIGURE CONSCIENCE",
                "I DO 4H REPORT",
            ],
            "internal_reference_number": [
                "ABC000542519",
                None,
            ],
            "external_reference_number": [
                "RO237719",
                "ZZTOPACDC",
            ],
            "ircs": [
                "FQ7058",
                "ZZ000000",
            ],
            "trip_number": [None, None],
            "value": [
                {
                    "dml": "DML 29",
                    "type": "FRENCH_EEZ_FISHING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.4142135624,
                },
                {
                    "dml": "DML 13",
                    "type": "FRENCH_EEZ_FISHING_ALERT",
                    "seaFront": "NAMO",
                    "riskFactor": 1.7411011266,
                },
            ],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
            ],
            "alert_config_name": [alert_config_name] * 2,
            "vessel_id": [2, 6],
            "latitude": [43.324, 43.324],
            "longitude": [5.359, 5.359],
            "flag_state": ["FR", "FR"],
        }
    )

    pd.testing.assert_frame_equal(
        pending_alerts.sort_values("vessel_id")
        .reset_index(drop=True)
        .drop(columns=["creation_date", "id"]),
        expected_pending_alerts.sort_values("vessel_id").reset_index(drop=True),
    )
