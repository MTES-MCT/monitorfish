from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import DDL

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_missions(number_of_months: int) -> pd.DataFrame:
    """
    Extracts missions data from Monitorenv database for the specified number of months.

    Args:
        number_of_months (int): number of months of controls data to extract, going
            backwards from the present.

    Raises:
        ValueError: if `number_of_months` is not of type `int`
        ValueError: if `number_of_months` is not between 1 and 240

    Returns:
        pd.DataFrame: DataFrame with missions data.
    """

    parse_dates = [
        "start_datetime_utc",
        "end_datetime_utc",
    ]

    dtypes = {
        "facade": "category",
        "deleted": bool,
        "mission_source": "category",
        "closed": bool,
    }

    try:
        assert isinstance(number_of_months, int)
    except AssertionError:
        raise ValueError(
            f"number_of_months must be of type int, got {type(number_of_months)}"
        )

    try:
        assert 0 < number_of_months <= 240
    except AssertionError:
        raise ValueError(
            f"number_of_months must be > 0 and <= 240, got {number_of_months}"
        )

    return extract(
        db_name="monitorenv_remote",
        query_filepath="monitorenv/missions.sql",
        parse_dates=parse_dates,
        dtypes=dtypes,
        params={"number_of_months": number_of_months},
    )


@task(checkpoint=False)
def extract_missions_control_units() -> pd.DataFrame:
    """
    Extracts all `missions_control_units` data from the Monitorenv database.

    Returns:
        pd.DataFrame: DataFrame of `missions_control_units`.
    """

    return extract(
        db_name="monitorenv_remote",
        query_filepath="monitorenv/missions_control_units.sql",
    )


@task(checkpoint=False)
def filter_missions_control_units(
    missions: pd.DataFrame, missions_control_units: pd.DataFrame
) -> pd.DataFrame:
    """
    Returns the subset of the input `missions_control_units` whose `mission_id` is
    present the `missions.id` Series.

    Args:
        missions (pd.DataFrame): DataFrame of missions. Must have an `id` column.
        missions_control_units (pd.DataFrame): DataFrame of missions_control_units.
          Must have a `mission_id` column.

    Returns:
        pd.DataFrame: Filtered `missions_control_units`.
    """
    return missions_control_units.loc[
        missions_control_units.mission_id.isin(set(missions.id))
    ].reset_index(drop=True)


@task(checkpoint=False)
def load_missions_and_missions_control_units(
    missions: pd.DataFrame, missions_control_units: pd.DataFrame, loading_mode: str
):
    # In "replace" loading mode, we want to replace all `missions`, so we use `replace`
    # loading mode.

    # In "upsert" loading mode, we want to replace only the missions whose `id` is
    # present in the DataFrame. So we use `id` as the identifier and `upsert` loading
    # mode.

    assert loading_mode in ("replace", "upsert")
    missions_id_column = "id" if loading_mode == "upsert" else None

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        load(
            missions,
            table_name="analytics_missions",
            schema="public",
            connection=connection,
            logger=prefect.context.get("logger"),
            pg_array_columns=["mission_types"],
            how=loading_mode,
            table_id_column=missions_id_column,
            df_id_column=missions_id_column,
            init_ddls=[
                DDL(
                    "ALTER TABLE public.analytics_missions_control_units "
                    "ADD CONSTRAINT "
                    "analytics_missions_control_units_mission_id_cascade_fkey "
                    "FOREIGN KEY (mission_id) "
                    "REFERENCES public.analytics_missions (id) "
                    "ON DELETE CASCADE;"
                ),
            ],
            end_ddls=[
                DDL(
                    "ALTER TABLE public.analytics_missions_control_units "
                    "DROP CONSTRAINT "
                    "analytics_missions_control_units_mission_id_cascade_fkey;"
                ),
            ],
        )

        load(
            missions_control_units,
            table_name="analytics_missions_control_units",
            schema="public",
            connection=connection,
            logger=prefect.context.get("logger"),
            how="append",
        )


with Flow("missions", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        # Parameters
        loading_mode = Parameter("loading_mode")
        number_of_months = Parameter("number_of_months")

        # Extract
        missions = extract_missions(number_of_months=number_of_months)
        missions_control_units = extract_missions_control_units()

        # Transform
        missions_control_units = filter_missions_control_units(
            missions, missions_control_units
        )

        # Load
        load_missions_and_missions_control_units(
            missions, missions_control_units, loading_mode=loading_mode
        )


flow.file_name = Path(__file__).name
