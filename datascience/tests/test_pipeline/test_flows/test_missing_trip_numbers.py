import pandas as pd
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.missing_trip_numbers import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_missing_trip_numbers_flow(reset_test_data):
    # Setup : reset trip numbers of a vessel to NULL
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(
            text("UPDATE logbook_reports SET trip_number = NULL WHERE cfr = 'SOCR4T3';")
        )

    initial_missing_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    initial_vessel_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    # Check that the only missing trip_numbers are those of the designated vessel
    pd.testing.assert_frame_equal(
        initial_missing_trip_numbers, initial_vessel_trip_numbers
    )

    # Run the flow to compute missing trip numbers
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check that the vessel whose trip numbers were set to NULL were correctly computed
    final_missing_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    final_vessel_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    assert len(final_missing_trip_numbers) == 0
    assert len(final_vessel_trip_numbers) == 24

    assert (
        final_vessel_trip_numbers.loc[
            final_vessel_trip_numbers.report_id
            == "83952732-ef89-4168-b2a1-df49d0aa1aff",
            "trip_number",
        ].values[0]
        == "20200001"
    )

    assert (
        final_vessel_trip_numbers.loc[
            final_vessel_trip_numbers.report_id
            == "1e1bff95-dfff-4cc3-82d3-d72b46fda745",
            "trip_number",
        ].values[0]
        == "20200002"
    )

    assert (
        final_vessel_trip_numbers.loc[
            ~final_vessel_trip_numbers.report_id.isin(
                [
                    "83952732-ef89-4168-b2a1-df49d0aa1aff",
                    "1e1bff95-dfff-4cc3-82d3-d72b46fda745",
                ]
            ),
            "trip_number",
        ]
        == "20200003"
    ).all()


def test_missing_trip_numbers_flow_overwrites_only_computed_trip_numbers(
    reset_test_data,
):
    # Setup : reset trip numbers of a vessel to NULL
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(
            text(
                """
            UPDATE logbook_reports
            SET trip_number = NULL
            WHERE cfr = 'SOCR4T3'
            AND report_id != '1e1bff95-dfff-4cc3-82d3-d72b46fda745';"""
            )
        )

    # Since only DAT messages trigger the increment of trip_numbers, we must ensure
    # that COR reports before the very first DAT report do not receive a NULL
    # trip_number.
    # By default the value '0' should be assigned to such reports.
    with e.begin() as connection:
        connection.execute(
            text(
                """
        UPDATE logbook_reports
        SET operation_type = 'COR'
        WHERE report_id = '83952732-ef89-4168-b2a1-df49d0aa1aff';"""
            )
        )

    initial_missing_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    initial_vessel_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        AND report_id != '1e1bff95-dfff-4cc3-82d3-d72b46fda745'
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    # Check that the only missing trip_numbers are those of the designated vessel
    pd.testing.assert_frame_equal(
        initial_missing_trip_numbers, initial_vessel_trip_numbers
    )

    # Run the flow to compute missing trip numbers
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check that the vessel whose trip numbers were set to NULL were correctly computed
    final_missing_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    final_vessel_trip_numbers = read_query(
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
        db="monitorfish_remote",
    )

    assert len(final_missing_trip_numbers) == 0
    assert len(final_vessel_trip_numbers) == 24

    # Default value '0' must be assigned to COR reports before the very first DAT
    # report
    assert (
        final_vessel_trip_numbers.loc[
            final_vessel_trip_numbers.report_id
            == "83952732-ef89-4168-b2a1-df49d0aa1aff",
            "trip_number",
        ].values[0]
        == "0"
    )

    # This trip number should not be updated : it is a real trip_number taken from the
    # raw_message, it should never be overwritten
    assert (
        final_vessel_trip_numbers.loc[
            final_vessel_trip_numbers.report_id
            == "1e1bff95-dfff-4cc3-82d3-d72b46fda745",
            "trip_number",
        ].values[0]
        == "SRC-TRP-TTT20200506194051795"
    )

    assert (
        final_vessel_trip_numbers.loc[
            ~final_vessel_trip_numbers.report_id.isin(
                [
                    "83952732-ef89-4168-b2a1-df49d0aa1aff",
                    "1e1bff95-dfff-4cc3-82d3-d72b46fda745",
                ]
            ),
            "trip_number",
        ]
        == "20200002"
    ).all()
