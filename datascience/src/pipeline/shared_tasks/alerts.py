from datetime import datetime
from typing import List

import pandas as pd
import prefect
import requests
from prefect import task

from config import PENDING_ALERT_VALIDATION_ENDPOINT_TEMPLATE
from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import (
    df_to_dict_series,
    get_unused_col_name,
    join_on_multiple_keys,
)
from src.pipeline.utils import delete_rows, get_table


@task(checkpoint=False)
def extract_silenced_alerts() -> pd.DataFrame:
    """
    Return active silenced alerts
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/silenced_alerts.sql",
    )


@task(checkpoint=False)
def extract_pending_alerts_ids_of_config_name(alert_config_name: str) -> List[int]:
    """
    Return ids of pending alerts corresponding to `alert_config_name`
    """
    logger = prefect.context.get("logger")
    pending_alerts = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pending_alerts_of_config_name.sql",
        params={"alert_config_name": alert_config_name},
    )
    ids = pending_alerts.id.unique().tolist()
    logger.info(f"Returning {len(ids)} pending alerts ids.")
    return ids


@task(checkpoint=False)
def validate_pending_alert(id: int) -> pd.DataFrame:
    logger = prefect.context.get("logger")
    url = PENDING_ALERT_VALIDATION_ENDPOINT_TEMPLATE.format(pending_alert_id=id)
    logger.info(f"Validating pending alert {id}.")
    r = requests.put(url)
    r.raise_for_status()


@task(checkpoint=False)
def make_alerts(
    vessels_in_alert: pd.DataFrame,
    alert_type: str,
    alert_config_name: str,
) -> pd.DataFrame:
    """
    Generates alerts from the input `vessels_in_alert`, which must contain the
    following columns :

      - `cfr`
      - `external_immatriculation`
      - `ircs`
      - `vessel_id`
      - `vessel_identifier`
      - `vessel_name`
      - `facade`
      - `dml`
      - `flag_state`
      - `risk_factor`
      - and optionally, `creation_date`, `latitude` and `longitude`

    If `creation_date` is not one of the columns, it will be added and filled with
    `datetime.utcnow`.

    If `latitude` and `longitude` are not columns of the input, they are added and
    filled with null values in the result.

    Args:
        vessels_in_alert (pd.DataFrame): `DateFrame` of vessels for which to
          create an alert.
        alert_type (str): `type` to specify in the built alerts.
        alert_config_name (str): `alert_config_name` to specify in the built alerts.
        creation_date (datetime): `creation_date` to specify in the built alerts.

    Returns:
        pd.DataFrame: `DataFrame` of alerts.
    """
    alerts = vessels_in_alert.copy(deep=True)
    alerts = alerts.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
        }
    )

    if "creation_date" not in alerts:
        alerts["creation_date"] = datetime.utcnow()

    if "latitude" not in alerts:
        alerts["latitude"] = None

    if "longitude" not in alerts:
        alerts["longitude"] = None

    alerts["type"] = alert_type
    alerts["value"] = df_to_dict_series(
        alerts.rename(
            columns={
                "facade": "seaFront",
                "risk_factor": "riskFactor",
            }
        )[["seaFront", "type", "riskFactor", "dml"]]
    )

    alerts["alert_config_name"] = alert_config_name

    return alerts[
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "flag_state",
            "vessel_id",
            "vessel_identifier",
            "creation_date",
            "latitude",
            "longitude",
            "type",
            "value",
            "alert_config_name",
        ]
    ]


@task(checkpoint=False)
def filter_silenced_alerts(
    alerts: pd.DataFrame, silenced_alerts: pd.DataFrame
) -> pd.DataFrame:
    """
    Filters `alerts` to keep only alerts that are not in `silenced_alerts`. Both input
    DataFrames must have columns :

      - internal_reference_number
      - external_reference_number
      - ircs
      - type

    In addition, the `alerts` DataFrame must have columns :

      - vessel_id
      - vessel_name
      - vessel_identifier
      - flag_state
      - facade
      - creation_date
      - latitude
      - longitude
      - value
      - alert_config_name

    Args:
        alerts (pd.DataFrame): positions alerts.
        silenced_alerts (pd.DataFrame): silenced positions alerts.

    Returns:
        pd.DataFrame: same as input with some rows removed.
    """
    vessel_id_cols = ["internal_reference_number", "external_reference_number", "ircs"]
    alert_id_cols = ["type"]

    id_col_name = get_unused_col_name("id", alerts)
    alerts[id_col_name] = range(len(alerts))

    alerts_to_remove = join_on_multiple_keys(
        alerts,
        silenced_alerts,
        or_join_keys=vessel_id_cols,
        how="inner",
        and_join_keys=alert_id_cols,
    )

    alert_ids_to_remove = set(alerts_to_remove[id_col_name])

    alerts = alerts.loc[~alerts[id_col_name].isin(alert_ids_to_remove)].reset_index(
        drop=True
    )

    return alerts[
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "flag_state",
            "vessel_id",
            "vessel_identifier",
            "creation_date",
            "latitude",
            "longitude",
            "value",
            "alert_config_name",
        ]
    ]


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
            table_name=table_name,
            schema=schema,
            logger=logger,
            how="append",
            jsonb_columns=["value"],
            nullable_integer_columns=["vessel_id"],
            connection=connection,
        )
