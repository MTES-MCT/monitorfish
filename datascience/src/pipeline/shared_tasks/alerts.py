import pandas as pd
import prefect
from prefect import task

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import join_on_multiple_keys
from src.pipeline.utils import delete_rows, get_table


@task(checkpoint=False)
def load_alerts(alerts: pd.DataFrame, alert_config_name: str):
    """
    Updates the `pending_alerts` that have the specified `alert_config_name` by:

    - deleting alerts in the `pending_alerts`table of the specified `alert_config_name`
    - inserting alerts of the `alerts` dataframe into the `pending_alerts` table

    Args:
        alerts (pd.DataFrame): Alerts to load into the `pending_alerts` table
        alert_config_name (str): Name that uniquely identifies the set of parameters
          used for the flow run
    """

    try:
        assert alert_config_name and isinstance(alert_config_name, str)
    except AssertionError:
        raise ValueError(
            (
                "alert_config_name must be a non null `str`, "
                f"got {alert_config_name} instead."
            )
        )

    schema = "public"
    table_name = "pending_alerts"
    logger = prefect.context.get("logger")

    e = create_engine("monitorfish_remote")

    with e.begin() as connection:

        table = get_table(
            table_name=table_name, schema=schema, conn=connection, logger=logger
        )

        # This cannot be done by using the `upsert` mode of the `load` fonction because
        # when the input DataFrame is empty, rows in the `pending_alerts` table that
        # correspond to the designated `alert_config_name` must be deleted, which does
        # not happen if there is not at least one row in the DataFrame that contains
        # the information of which `alert_config_name` needs to be deleted.
        delete_rows(
            table=table,
            id_column="alert_config_name",
            ids_to_delete=[alert_config_name],
            connection=connection,
            logger=logger,
        )

        load(
            alerts,
            table_name="pending_alerts",
            schema="public",
            logger=logger,
            how="append",
            jsonb_columns=["value"],
            connection=connection,
        )


@task(checkpoint=False)
def extract_silenced_alerts() -> pd.DataFrame:
    """
    Return active silenced alerts: the FLow is computed before silenced_before_date
    and after silenced_after_date if not null
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/silenced_alerts.sql",
    )


@task(checkpoint=False)
def filter_silenced_alerts(
    alerts: pd.DataFrame, silenced_alerts: pd.DataFrame
) -> pd.DataFrame:
    """
    Filters `alerts` to keep only alerts that are not in `silenced_alerts`. Both input DataFrames must have columns :

      - internal_reference_number
      - external_reference_number
      - ircs
      - facade
      - silenced_sea_front
      - type or silenced_type

    Args:
        alerts (pd.DataFrame): positions alerts.
        silenced_alerts (pd.DataFrame): silenced positions alerts.

    Returns:
        pd.DataFrame: same as input with some rows removed.
    """
    vessel_id_cols = ["internal_reference_number", "external_reference_number", "ircs"]

    alerts = join_on_multiple_keys(
        alerts, silenced_alerts, on=vessel_id_cols, how="left"
    )

    return alerts.loc[
        (alerts.facade != alerts.silenced_sea_front)
        | (alerts.type != alerts.silenced_type),
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "vessel_identifier",
            "creation_date",
            "value",
            "alert_config_name",
        ],
    ]
