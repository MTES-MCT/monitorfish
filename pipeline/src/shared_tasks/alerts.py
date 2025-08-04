from datetime import datetime
from typing import List

import pandas as pd
import requests
from prefect import get_run_logger, task

from config import (
    PENDING_ALERT_VALIDATION_ENDPOINT_TEMPLATE,
    REPORTING_ARCHIVING_ENDPOINT_TEMPLATE,
)
from src.db_config import create_engine
from src.entities.alerts import AlertType
from src.generic_tasks import extract, load
from src.processing import (
    df_to_dict_series,
    join_on_multiple_keys,
    left_isin_right_by_decreasing_priority,
)
from src.utils import delete_rows, get_table


@task
def extract_silenced_alerts(
    alert_type: str, number_of_hours: int = 0, alert_id: str | None = None
) -> pd.DataFrame:
    """
    Return DataFrame of vessels with active silenced alerts of the given type.

    Args:
        alert_type (str): Type of alert for which to extract silenced alerts
        number_of_hours (int, optional): Number of hours from current time to extract.
          Defaults to 0.

    Returns:
        pd.DataFrame: Silenced alerts with columns
    """

    alert_type = AlertType(alert_type)

    query_filepath = (
        "monitorfish/silenced_alerts_with_alert_id.sql"
        if alert_id is not None
        else "monitorfish/silenced_alerts.sql"
    )

    params = {"alert_type": alert_type.value, "number_of_hours": number_of_hours}
    if alert_id is not None:
        params["alert_id"] = alert_id

    return extract(
        db_name="monitorfish_remote",
        query_filepath=query_filepath,
        params=params,
    )


@task
def extract_active_reportings(alert_type: str) -> pd.DataFrame:
    """
    Return DataFrame of vessels with active (non archived) reporting originating from
    alerts of the given type.
    """

    alert_type = AlertType(alert_type)
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/active_reportings.sql",
        params={"alert_type": alert_type.value},
    )


@task
def extract_pending_alerts_ids_of_type(alert_type: str) -> List[int]:
    """
    Return ids of pending alerts corresponding to `alert_type`
    """
    alert_type = AlertType(alert_type)
    logger = get_run_logger()
    pending_alerts = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pending_alerts_of_type.sql",
        params={"alert_type": alert_type.value},
    )
    ids = pending_alerts.id.unique().tolist()
    logger.info(f"Returning {len(ids)} pending alerts ids.")
    return ids


@task
def extract_non_archived_reportings_ids_of_type(alert_type: str) -> List[int]:
    """
    Return ids of reportings corresponding to `alert_type`
    """
    alert_type = AlertType(alert_type)
    logger = get_run_logger()
    reportings = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/non_archived_reportings_of_type.sql",
        params={"reporting_type": alert_type.value},
    )
    ids = reportings.id.unique().tolist()
    logger.info(f"Returning {len(ids)} reportings ids.")
    return ids


@task
def archive_reporting(id: int):
    logger = get_run_logger()
    url = REPORTING_ARCHIVING_ENDPOINT_TEMPLATE.format(reporting_id=id)
    logger.info(f"Archiving reporting {id}.")
    r = requests.put(url)
    r.raise_for_status()


@task
def validate_pending_alert(id: int):
    logger = get_run_logger()
    url = PENDING_ALERT_VALIDATION_ENDPOINT_TEMPLATE.format(pending_alert_id=id)
    logger.info(f"Validating pending alert {id}.")
    r = requests.put(url)
    r.raise_for_status()


@task
def make_alerts(
    vessels_in_alert: pd.DataFrame,
    alert_type: str,
    *,
    alert_id: int | None = None,
    name: str | None = None,
    description: str | None = None,
    natinf_code: int | None = None,
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
      - `triggering_behaviour_datetime_utc`
      - and optionally, `depth`, `latitude` and `longitude`

    If `latitude` and `longitude` are not columns of the input, they are added and
    filled with null values in the result.

    If `depth` is a column of the input, it is added to the `value` attributes.

    Args:
        vessels_in_alert (pd.DataFrame): `DateFrame` of vessels for which to
          create an alert.
        alert_type (str): `type` to specify in the built alerts.
        alert_id (str | None): `alert_id` to specify in the built alerts,
          defaults to None.
        name (str | None): name of the alert, defaults to None.
        description (str | None): description of the alert, defaults to None.
        natinf_code (str | None): natinf code associated with the alert, defaults to
          None.

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

    alerts["creation_date"] = datetime.utcnow()

    if "latitude" not in alerts:
        alerts["latitude"] = None

    if "longitude" not in alerts:
        alerts["longitude"] = None

    alert_type = AlertType(alert_type).value
    alerts["type"] = alert_type
    alert_type_suffix = f"/{alert_id}" if alert_id is not None else ""
    alerts["alert_config_name"] = alert_type + alert_type_suffix

    value_cols = ["seaFront", "type", "riskFactor", "dml"]
    if "depth" in alerts.columns:
        value_cols += ["depth"]

    if name is not None:
        alerts["name"] = name
        value_cols.append("name")

    if description is not None:
        alerts["description"] = description
        value_cols.append("description")

    if natinf_code is not None:
        alerts["natinfCode"] = natinf_code
        value_cols.append("natinfCode")

    if alert_id is not None:
        alerts["alertId"] = alert_id
        value_cols.append("alertId")

    alerts["value"] = df_to_dict_series(
        alerts.rename(
            columns={
                "facade": "seaFront",
                "risk_factor": "riskFactor",
            }
        )[value_cols]
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
            "triggering_behaviour_datetime_utc",
            "creation_date",
            "latitude",
            "longitude",
            "value",
            "alert_config_name",
        ]
    ]


@task
def filter_alerts(
    alerts: pd.DataFrame,
    vessels_with_silenced_alerts: pd.DataFrame,
    vessels_with_active_reportings: pd.DataFrame = None,
) -> pd.DataFrame:
    """
    Filters `alerts` to keep only alerts of vessels that are not in
    `vessels_with_silenced_alerts`. If `vessels_with_active_reportings` is provided,
    alerts of vessels that are in this DataFrame are also removed.

    All input DataFrames must have columns :

      - internal_reference_number
      - external_reference_number
      - ircs

    In addition, the `alerts` DataFrame must have columns :

      - vessel_id
      - vessel_name
      - vessel_identifier
      - flag_state
      - facade
      - triggering_behaviour_datetime_utc
      - creation_date
      - latitude
      - longitude
      - value
      - alert_config_name

    and the `silenced_alerts` DataFrame must have a `silenced_before_date`
    column.

    Args:
        alerts (pd.DataFrame): positions alerts.
        vessels_with_silenced_alerts (pd.DataFrame): vessels with silenced alerts.

    Returns:
        pd.DataFrame: same as input with some rows removed.
    """
    vessel_id_cols = ["internal_reference_number", "external_reference_number", "ircs"]

    alerts = join_on_multiple_keys(
        alerts, vessels_with_silenced_alerts, or_join_keys=vessel_id_cols, how="left"
    )

    alerts = alerts.loc[
        (
            (alerts.silenced_before_date.isna())
            | (alerts.triggering_behaviour_datetime_utc > alerts.silenced_before_date)
        ),
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
        ],
    ]

    if isinstance(vessels_with_active_reportings, pd.DataFrame):
        alerts = alerts.loc[
            ~left_isin_right_by_decreasing_priority(
                alerts[vessel_id_cols], vessels_with_active_reportings[vessel_id_cols]
            )
        ]

    alerts = alerts.sort_values("internal_reference_number").reset_index(drop=True)

    return alerts


@task
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
    logger = get_run_logger()

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
