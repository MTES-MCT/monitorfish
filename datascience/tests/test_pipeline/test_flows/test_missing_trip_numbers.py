import pandas as pd

from src.db_config import create_engine
from src.pipeline.flows.missing_trip_numbers import flow
from src.read_query import read_query


def test_missing_trip_numbers_flow(reset_test_data):
    # Setup : reset trip numbers of a vessel to NULL
    e = create_engine("monitorfish_remote")
    e.execute("UPDATE logbook_reports SET trip_number = NULL WHERE cfr = 'SOCR4T3';")

    initial_missing_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
    )

    initial_vessel_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
    )

    # Check that the only missing trip_numbers are those of the designated vessel
    pd.testing.assert_frame_equal(
        initial_missing_trip_numbers, initial_vessel_trip_numbers
    )

    # Run the flow to compute missing trip numbers
    state = flow.run()
    assert state.is_successful()

    # Check that the vessel whose trip numbers were set to NULL were correctly computed
    final_missing_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
    )

    final_vessel_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
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
    e.execute(
        """
    UPDATE logbook_reports
    SET trip_number = NULL
    WHERE cfr = 'SOCR4T3'
    AND report_id != '1e1bff95-dfff-4cc3-82d3-d72b46fda745';"""
    )

    initial_missing_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
    )

    initial_vessel_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        AND report_id != '1e1bff95-dfff-4cc3-82d3-d72b46fda745'
        ORDER BY report_id;
        """,
    )

    # Check that the only missing trip_numbers are those of the designated vessel
    pd.testing.assert_frame_equal(
        initial_missing_trip_numbers, initial_vessel_trip_numbers
    )

    # Run the flow to compute missing trip numbers
    state = flow.run()
    assert state.is_successful()

    # Check that the vessel whose trip numbers were set to NULL were correctly computed
    final_missing_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE trip_number IS NULL
        ORDER BY report_id;
        """,
    )

    final_vessel_trip_numbers = read_query(
        "monitorfish_remote",
        """
        SELECT
            report_id,
            trip_number
        FROM logbook_reports
        WHERE cfr = 'SOCR4T3'
        ORDER BY report_id;
        """,
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
        == "20200003"
    ).all()
