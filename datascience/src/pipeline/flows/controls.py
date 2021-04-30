from typing import Union

import pandas as pd
import prefect
from prefect import Flow, task
from sqlalchemy.exc import InvalidRequestError

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import (
    df_to_dict_series,
    df_values_to_psql_arrays,
    to_json,
    zeros_ones_to_bools,
)
from src.pipeline.utils import delete, get_table, psql_insert_copy

# ********************************** Tasks and flow ***********************************


@task(checkpoint=False)
def extract_controls():

    parse_dates = [
        "control_datetime_utc",
        "input_start_datetime_utc",
        "input_end_datetime_utc",
    ]

    dtypes = {
        "controller_id": "category",
        "control_type": "category",
        "facade": "category",
        "port_locode": "category",
        "mission_order": "category",
        "vessel_targeted": "category",
        "cnsp_called_unit": "category",
        "infraction": "category",
        "cooperative": "category",
        "diversion": "category",
        "escort_to_quay": "category",
        "seizure": "category",
        "gear_1_code": "category",
        "gear_2_code": "category",
        "gear_3_code": "category",
        "gear_1_was_controlled": "category",
        "gear_2_was_controlled": "category",
        "gear_3_was_controlled": "category",
    }

    return extract(
        db_name="fmc",
        query_filepath="fmc/controles.sql",
        parse_dates=parse_dates,
        dtypes=dtypes,
    )


@task(checkpoint=False)
def transform_controls(controls):

    logger = prefect.context.get("logger")

    # ---------------------------------------------------------------------------------
    # Transform boolean values stored as "0"s and "1"s in Oracle to booleans
    logger.info("Converting '0's and '1' to booleans")
    bool_cols = [
        "mission_order",
        "vessel_targeted",
        "cnsp_called_unit",
        "infraction",
        "cooperative",
        "diversion",
        "escort_to_quay",
        "seizure",
        "gear_1_was_controlled",
        "gear_2_was_controlled",
        "gear_3_was_controlled",
    ]

    controls[bool_cols] = zeros_ones_to_bools(controls[bool_cols])

    # ---------------------------------------------------------------------------------
    # Transform gear control data
    # 1. First build a dictionnary of control data for each of the 3 gears controlled

    logger.info("Transforming gears control data columns to dictionnary")
    col_maps = [
        {
            "column_names_to_json_keys": {
                "gear_1_code": "gearCode",
                "gear_1_was_controlled": "gearWasControlled",
                "declared_mesh_1": "declaredMesh",
                "controlled_mesh_1": "controlledMesh",
            },
            "result_col": "gear_1",
        },
        {
            "column_names_to_json_keys": {
                "gear_2_code": "gearCode",
                "gear_2_was_controlled": "gearWasControlled",
                "declared_mesh_2": "declaredMesh",
                "controlled_mesh_2": "controlledMesh",
            },
            "result_col": "gear_2",
        },
        {
            "column_names_to_json_keys": {
                "gear_3_code": "gearCode",
                "gear_3_was_controlled": "gearWasControlled",
                "declared_mesh_3": "declaredMesh",
                "controlled_mesh_3": "controlledMesh",
            },
            "result_col": "gear_3",
        },
    ]

    for col_map in col_maps:

        gear_data_df = controls[col_map["column_names_to_json_keys"].keys()]
        gear_data_df = gear_data_df.rename(columns=col_map["column_names_to_json_keys"])

        gear_data_series = df_to_dict_series(
            df=gear_data_df.dropna(subset=["gearCode"]),
            result_colname=col_map["result_col"],
        )

        controls = controls.join(gear_data_series)
        controls = controls.drop(columns=col_map["column_names_to_json_keys"].keys())

    # 2. Then group the 3 dictionnaries containing the data of the 3 gear controls into
    # a numpy array of dictionnaries
    controls["gear_controls"] = controls[["gear_1", "gear_2", "gear_3"]].apply(
        lambda row: list(row.dropna()), axis=1
    )

    # 3. Finally drop the unneeded temporary columns with the 3 dictionnaries
    controls = controls.drop(columns=["gear_1", "gear_2", "gear_3"])

    # ---------------------------------------------------------------------------------
    # Transform the list of infraction ids from string to list
    logger.info("Transforming infraction ids from string to list")
    controls["infraction_ids"] = controls.infraction_ids.fillna("").map(
        lambda s: s.split(", ")
    )

    return controls


@task(checkpoint=False)
def load_controls(controls):
    load(
        controls,
        table_name="controls",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        pg_array_columns=["infraction_ids"],
        jsonb_columns=["gear_controls"],
        delete_before_insert=True,
    )


with Flow("Extract clean and load controls data") as flow:
    controls = extract_controls()
    controls = transform_controls(controls)
    load_controls(controls)
