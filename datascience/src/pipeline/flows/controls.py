from pathlib import Path

import geopandas as gpd
import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.fao_areas import remove_redundant_fao_area_codes
from src.pipeline.helpers.segments import attribute_segments_to_catches
from src.pipeline.processing import (
    df_to_dict_series,
    try_get_factory,
    zeros_ones_to_bools,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.facades import extract_facade_areas
from src.pipeline.shared_tasks.segments import (
    extract_segments_of_current_year,
    unnest_segments,
)


# ********************************** Tasks and flow ***********************************
@task(checkpoint=False)
def extract_controls(number_of_months: int) -> pd.DataFrame:
    """
    Extracts controls data from FMC database.

    Args:
        number_of_months (int): number of months of controls data to extract, going
            backwards from the present.

    Returns:
        pd.DataFrame: DataFrame with controls data.
    """

    parse_dates = [
        "control_datetime_utc",
        "input_start_datetime_utc",
        "input_end_datetime_utc",
    ]

    dtypes = {
        "controller_id": "category",
        "control_type": "category",
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
        db_name="fmc",
        query_filepath="fmc/controls.sql",
        parse_dates=parse_dates,
        dtypes=dtypes,
        params={"number_of_months": number_of_months},
    )


@task(checkpoint=False)
def extract_catch_controls() -> pd.DataFrame:
    return extract(
        db_name="fmc",
        query_filepath="fmc/catch_controls.sql",
    )


@task(checkpoint=False)
def extract_ports() -> pd.DataFrame:
    """
    Extracts ports as a `DataFrame`.

    Returns:
        pd.DataFrame : DataFrame of ports.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/ports_fao_areas_and_facade.sql",
    )


@task(checkpoint=False)
def extract_fao_areas() -> gpd.GeoDataFrame:
    """
    Extracts FAO areas as a `GeoDataFrame`.

    Returns:
        gpd.GeoDataFrame : GeoDataFrame of FAO areas.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fao_areas.sql",
        backend="geopandas",
        geom_col="geometry",
        crs=4326,
    )


@task(checkpoint=False)
def transform_catch_controls(catch_controls: pd.DataFrame) -> pd.DataFrame:

    catch_controls = catch_controls.copy(deep=True)
    catch_controls_columns = {
        "species_code": "speciesCode",
        "catch_weight": "weight",
        "number_fish": "nbFish",
    }

    catch_controls = catch_controls.rename(columns=catch_controls_columns)
    catch_controls["catch_controls"] = df_to_dict_series(
        catch_controls[catch_controls_columns.values()], remove_nulls=True
    )

    catch_controls = (
        catch_controls.groupby("id")["catch_controls"].apply(list).reset_index()
    )

    return catch_controls


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
def compute_controls_fao_areas(
    controls: pd.DataFrame, fao_areas: gpd.GeoDataFrame, ports: pd.DataFrame
) -> pd.DataFrame:
    """
    Compute the FAO area(s) of controls.

    For controls with a location (latitude and longitude), the FAO area of the location
    of the control is returned.

    For controls with a port (locode), the FAO area(s) of the port are taken.

    NB : controls that have no fao_area (because they lack location or port information
    or because their location / ports does not belong to an FAO area) will not be
    included in the result.

    Args:
        controls (pd.DataFrame): controls with at least `id`, `latitude`, `longitude`
          and `port_locode` columns
        fao_areas (gpd.GeoDataFrame): FAO areas with `f_code` column (and geometry)
        ports (pd.DataFrame): ports with `locode` and `fao_areas` columns

    Returns:
        pd.DataFrame: controls with FAO areas added
    """

    # For controls with a latitude and longitude (air and sea controls), assign the
    # corresponding FAO area

    localized_controls = controls.loc[
        (controls.longitude.notnull()) & (controls.latitude.notnull()),
        ["id", "latitude", "longitude"],
    ]

    localized_controls = gpd.GeoDataFrame(
        localized_controls,
        geometry=gpd.points_from_xy(
            localized_controls.longitude, localized_controls.latitude
        ),
        crs=4326,
    )

    localized_controls = (
        gpd.sjoin(
            localized_controls,
            fao_areas,
        )[["id", "f_code"]]
        .groupby("id")["f_code"]
        .agg(list)
        .map(lambda l: remove_redundant_fao_area_codes(l))
        .rename("fao_areas")
        .reset_index()
    )

    # For controls with a port (land controls), assign the corresponding FAO area

    controls_at_port = controls.loc[
        (controls.longitude.isna() | controls.latitude.isna())
        & (controls.port_locode.notnull()),
        ["id", "port_locode"],
    ]

    controls_at_port = pd.merge(
        controls_at_port,
        ports.rename(columns={"locode": "port_locode"}),
        on="port_locode",
    )[["id", "fao_areas"]]

    # Concatenate controls

    controls_fao_areas = pd.concat([localized_controls, controls_at_port])

    return controls_fao_areas


@task(checkpoint=False)
def compute_controls_facade(
    controls: pd.DataFrame, facade_areas: gpd.GeoDataFrame, ports: pd.DataFrame
) -> pd.DataFrame:
    """
    Compute the facade of controls.

    For controls with a location (latitude and longitude), the facade of the
    location of the control is returned.

    For controls with a port (locode), the facade of the port is taken.

    NB : controls that have no facade (because they lack location or port information
    or because their location / ports does not belong to a facade area) will not be
    included in the result.

    Args:
        controls (pd.DataFrame): controls with at least `id`, `latitude`, `longitude`
          and `port_locode` columns
        facade_areas (gpd.GeoDataFrame): facades with `facade` column (and
          geometry)
        ports (pd.DataFrame): ports with `locode` and `facade` columns

    Returns:
        pd.DataFrame: controls with facade added
    """
    # For controls with a latitude and longitude (air and sea controls), assign the
    # corresponding facade

    localized_controls = controls.loc[
        (controls.longitude.notnull()) & (controls.latitude.notnull()),
        ["id", "latitude", "longitude"],
    ]

    localized_controls = gpd.GeoDataFrame(
        localized_controls,
        geometry=gpd.points_from_xy(
            localized_controls.longitude, localized_controls.latitude
        ),
        crs=4326,
    )

    localized_controls = gpd.sjoin(localized_controls, facade_areas)[["id", "facade"]]

    # For controls with a port (land controls), assign the corresponding facade

    controls_at_port = controls.loc[
        (controls.longitude.isna() | controls.latitude.isna())
        & (controls.port_locode.notnull()),
        ["id", "port_locode"],
    ]

    controls_at_port = pd.merge(
        controls_at_port,
        ports.rename(columns={"locode": "port_locode"}),
        on="port_locode",
    )[["id", "facade"]]

    # Concatenate controls

    controls_facade = pd.concat([localized_controls, controls_at_port])

    return controls_facade


@task(checkpoint=False)
def compute_controls_segments(
    controls: pd.DataFrame,
    catch_controls: pd.DataFrame,
    controls_fao_areas: pd.DataFrame,
    controls_facade: pd.DataFrame,
    segments: pd.DataFrame,
) -> pd.DataFrame:

    controls = pd.merge(
        pd.merge(controls, catch_controls, how="left", on="id"),
        controls_fao_areas,
        how="left",
        on="id",
    )

    controls_catches = (
        controls[["id", "gear_controls", "catch_controls", "fao_areas"]]
        .explode("fao_areas")
        .rename(columns={"fao_areas": "fao_area"})
        .explode("gear_controls")
        .explode("catch_controls")
        .assign(gear=lambda x: x.gear_controls.map(try_get_factory("gearCode")))
        .assign(species=lambda x: x.catch_controls.map(try_get_factory("speciesCode")))
        .reset_index()[["id", "fao_area", "species", "gear"]]
    )

    controls_catches = controls_catches.where(controls_catches.notnull(), None)

    controls_segments = (
        attribute_segments_to_catches(
            controls_catches,
            segments[["segment", "fao_area", "gear", "species"]],
        )
        .groupby("id")["segment"]
        .unique()
        .reset_index()
        .rename(columns={"segment": "segments"})
    )

    controls = pd.merge(
        pd.merge(controls, controls_segments, how="left", on="id"),
        controls_facade,
        how="left",
        on="id",
    )

    return controls


@task(checkpoint=False)
def load_controls(controls: pd.DataFrame, how: str):
    load(
        controls,
        table_name="controls",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        pg_array_columns=["infraction_ids", "segments", "fao_areas"],
        jsonb_columns=["gear_controls", "catch_controls"],
        how=how,
        table_id_column="id",
        df_id_column="id",
    )


with Flow("Controls", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Parameters
        loading_mode = Parameter("loading_mode")
        number_of_months = Parameter("number_of_months")

        # Extract
        controls = extract_controls(number_of_months=number_of_months)
        fao_areas = extract_fao_areas()
        facade_areas = extract_facade_areas()
        ports = extract_ports()
        segments = extract_segments_of_current_year()
        catch_controls = extract_catch_controls()

        # Transform
        segments = unnest_segments(segments)
        controls = transform_controls(controls)
        catch_controls = transform_catch_controls(catch_controls)
        controls_fao_areas = compute_controls_fao_areas(controls, fao_areas, ports)
        controls_facade = compute_controls_facade(controls, facade_areas, ports)
        controls = compute_controls_segments(
            controls, catch_controls, controls_fao_areas, controls_facade, segments
        )

        # Load
        load_controls(controls, how=loading_mode)

flow.file_name = Path(__file__).name
