from pathlib import Path
from typing import Tuple

import geopandas as gpd
import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import DDL

from config import POSEIDON_CONTROL_ID_TO_MONITORENV_MISSION_ID_SHIFT
from src.db_config import create_engine
from src.pipeline.entities.missions import (
    InfractionType,
    MissionActionType,
    MissionOrigin,
    MissionType,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.controls import make_infractions
from src.pipeline.helpers.fao_areas import remove_redundant_fao_area_codes
from src.pipeline.helpers.segments import attribute_segments_to_catches_by_year
from src.pipeline.processing import (
    df_to_dict_series,
    try_get_factory,
    zeros_ones_to_bools,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.facades import extract_facade_areas
from src.pipeline.shared_tasks.segments import extract_all_segments, unnest_segments


# ********************************** Tasks and flow ***********************************
@task(checkpoint=False)
def extract_controls(number_of_months: int) -> pd.DataFrame:
    """
    Extracts controls data from FMC database for the specified number of months, going
    back at most to January 1st 2013.

    Args:
        number_of_months (int): number of months of controls data to extract, going
            backwards from the present. If the computed start date of the extraction is
            before January 1st 2013, the data will be extracted from January 1st 2013 to
            the present.

    Returns:
        pd.DataFrame: DataFrame with controls data.
    """

    parse_dates = [
        "action_datetime_utc",
    ]

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
    catch_controls["species_onboard"] = df_to_dict_series(
        catch_controls[catch_controls_columns.values()], remove_nulls=True
    )

    catch_controls = (
        catch_controls.groupby("id")["species_onboard"].apply(list).reset_index()
    )

    return catch_controls


@task(checkpoint=False)
def transform_controls(controls: pd.DataFrame):
    controls = controls.copy(deep=True)
    logger = prefect.context.get("logger")

    # ---------------------------------------------------------------------------------
    # Transform boolean values stored as "0"s and "1"s in Oracle to booleans
    logger.info("Converting '0's and '1' to booleans")
    bool_cols = [
        "mission_order",
        "vessel_targeted",
        "diversion",
        "seizure",
        "gear_1_was_controlled",
        "gear_2_was_controlled",
        "gear_3_was_controlled",
    ]

    controls[bool_cols] = zeros_ones_to_bools(controls[bool_cols])
    controls["vessel_targeted"] = controls["vessel_targeted"].map(
        {True: "YES", False: "NO"}
    )

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
        gear_data_df["hasUncontrolledMesh"] = gear_data_df.controlledMesh.isna()

        gear_data_series = df_to_dict_series(
            df=gear_data_df.dropna(subset=["gearCode"]),
            result_colname=col_map["result_col"],
        )

        controls = controls.join(gear_data_series)
        controls = controls.drop(columns=col_map["column_names_to_json_keys"].keys())

    # 2. Then group the 3 dictionnaries containing the data of the 3 gear controls into
    # a numpy array of dictionnaries
    controls["gear_onboard"] = controls[["gear_1", "gear_2", "gear_3"]].apply(
        lambda row: list(row.dropna()), axis=1
    )

    # 3. Finally drop the unneeded temporary columns with the 3 dictionnaries
    controls = controls.drop(columns=["gear_1", "gear_2", "gear_3"])

    # ---------------------------------------------------------------------------------
    # Transform the list of infraction ids from string to list

    logbook_natinfs = {
        27689,
        27885,
        20235,
        20234,
        10409,
        20236,
        27886,
        10405,
        20246,
        20213,
    }
    gear_natinfs = {
        7059,
        27724,
        2593,
        7057,
        27725,
        7060,
        20242,
        12918,
        27723,
        20243,
        20220,
    }
    species_natinfs = {12900, 7062, 7983, 7061, 7063, 27730, 7984, 12902, 28346}

    logger.info("Transforming infraction natinfs from string to list")

    controls["infraction_natinfs"] = controls.infraction_natinfs.map(
        lambda s: set(map(int, s.split(", "))), na_action="ignore"
    )

    logger.info("Transformation `infraction` field to InfractionType objects.")
    controls["infraction_type"] = controls.infraction.map(
        InfractionType.from_poseidon_infraction_field
    )

    logger.info("Creating gear_infractions")
    if len(controls) == 0:
        controls["gear_infractions"] = None
    else:
        controls["gear_infractions"] = controls.apply(
            lambda row: make_infractions(
                row["infraction_natinfs"],
                row["infraction_type"],
                only_natinfs=gear_natinfs,
            ),
            axis=1,
        )

    logger.info("Creating species_infractions")
    if len(controls) == 0:
        controls["species_infractions"] = None
    else:
        controls["species_infractions"] = controls.apply(
            lambda row: make_infractions(
                row["infraction_natinfs"],
                row["infraction_type"],
                only_natinfs=species_natinfs,
            ),
            axis=1,
        )

    logger.info("Creating logbook_infractions")
    if len(controls) == 0:
        controls["logbook_infractions"] = None
    else:
        controls["logbook_infractions"] = controls.apply(
            lambda row: make_infractions(
                row["infraction_natinfs"],
                row["infraction_type"],
                only_natinfs=logbook_natinfs,
            ),
            axis=1,
        )

    logger.info("Creating other_infractions")
    if len(controls) == 0:
        controls["other_infractions"] = None
    else:
        controls["other_infractions"] = controls.apply(
            lambda row: make_infractions(
                row["infraction_natinfs"],
                row["infraction_type"],
                exclude_natinfs=set.union(
                    logbook_natinfs, gear_natinfs, species_natinfs
                ),
            ),
            axis=1,
        )

    controls = controls.drop(
        columns=["infraction_natinfs", "infraction", "infraction_type"]
    )

    controls["action_type"] = controls.control_type.map(
        MissionActionType.from_poseidon_control_type
    )
    controls = controls.drop(columns=["control_type"])

    controls["mission_types"] = controls.action_type.map(
        MissionType.from_mission_action_type
    ).map(lambda mission_type: [mission_type.value])

    controls["seizure_and_diversion"] = controls["diversion"].fillna(False)

    # In historical data, there is only one field "seizure" which does not specify what
    # was seized (gears and/or species). This information is not available and
    # upon import is considered both species and gears are seized when "seized" was
    # true in historical data.
    controls["has_some_gears_seized"] = controls["seizure"].fillna(False)
    controls["has_some_species_seized"] = controls["seizure"].fillna(False)
    controls = controls.drop(columns=["seizure", "diversion"])

    # Mapping controls on outdated ports to new ports

    old_to_new_ports_mapping = {
        "FRGN2": "FRGN3",
        "FRSNF": "FRS22",
        "FRBFS": "FRBH4",
        "FRBPV": "FRALM",
        "FRJMN": "FR2GO",
        "FRFBX": "FRSC9",
        "FRJLR": "FRCJH",
        "FRGDC": "FRGCP",
        "FRDCC": "FRLZF",
        "FRFAY": "FRHOT",
        "FRMCC": "FRHCN",
        "FRERQ": "FRQUY",
        "FRNBR": "FRCQ2",
        "FRPLJ": "FRPU4",
        "FRJPL": "FRPB2",
        "FRXSP": "PMFSP",
        "FRASM": "FRVM6",
    }

    controls["port_locode"] = controls.port_locode.where(
        ~controls.port_locode.isin(old_to_new_ports_mapping),
        controls.port_locode.map(old_to_new_ports_mapping),
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

    # For controls with a latitudide and longitude (air and sea controls), assign the
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
        .map(lambda li: remove_redundant_fao_area_codes(li))
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
        pd.DataFrame: DataFrame with columns `id` and `facade`
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

    # For controls anterior to the first year with segment definitions, we use the
    first_year_with_segment_defs = segments.year.min()
    controls["year"] = controls.action_datetime_utc.map(lambda dt: dt.year)
    controls["first_year_with_segment_defs"] = first_year_with_segment_defs
    controls["year"] = controls[["year", "first_year_with_segment_defs"]].max(axis=1)
    controls = controls.drop(columns=["first_year_with_segment_defs"])

    controls_catches = (
        controls[["id", "year", "gear_onboard", "species_onboard", "fao_areas"]]
        .explode("fao_areas")
        .rename(columns={"fao_areas": "fao_area"})
        .explode("gear_onboard")
        .explode("species_onboard")
        .assign(gear=lambda x: x.gear_onboard.map(try_get_factory("gearCode")))
        .assign(species=lambda x: x.species_onboard.map(try_get_factory("speciesCode")))
        .reset_index()[["id", "year", "fao_area", "species", "gear"]]
    )

    controls_catches = controls_catches.where(controls_catches.notnull(), None)
    controls_segments = (
        attribute_segments_to_catches_by_year(
            controls_catches,
            segments[
                ["segment", "segment_name", "year", "fao_area", "gear", "species"]
            ],
        )[["id", "segment", "segment_name"]]
        .drop_duplicates()
        .rename(columns={"segment_name": "segmentName"})
    )
    controls_segments["segment"] = df_to_dict_series(
        controls_segments[["segment", "segmentName"]]
    )

    controls_segments = (
        controls_segments.groupby("id")[["segment", "segmentName"]]
        .agg(list)
        .reset_index()
        .rename(columns={"segment": "segments"})[["id", "segments"]]
    )

    controls = pd.merge(
        pd.merge(controls, controls_segments, how="left", on="id"),
        controls_facade,
        how="left",
        on="id",
    )
    controls = controls.drop(columns=["year"])

    # Fill null values in jsonb array volumns with []
    controls["species_onboard"] = controls.species_onboard.map(
        lambda li: li if isinstance(li, list) else []
    )

    controls["fao_areas"] = controls.fao_areas.map(
        lambda li: li if isinstance(li, list) else []
    )

    controls["segments"] = controls.segments.map(
        lambda li: li if isinstance(li, list) else []
    )

    return controls


@task(checkpoint=False)
def make_missions_actions_and_missions_control_units(
    controls: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    # Posedion control ids are shifted to avoid any overlap the the ids of missions
    # created in Monitorenv.
    # The resulting shifted index is used both as the mission_action id in Monitorfish
    # and as mission id in Monitorenv.
    controls["id"] = controls["id"] + POSEIDON_CONTROL_ID_TO_MONITORENV_MISSION_ID_SHIFT

    # Create missions
    missions_columns = [
        "id",
        "action_datetime_utc",
        "open_by",
        "facade",
        "mission_order",
        "mission_types",
        "closed_by",
    ]

    missions = controls[missions_columns].copy(deep=True)
    missions["deleted"] = False
    missions["mission_source"] = MissionOrigin.POSEIDON_CNSP
    missions["closed"] = missions.closed_by.notnull()
    missions["start_datetime_utc"] = missions["action_datetime_utc"]
    missions["end_datetime_utc"] = missions["action_datetime_utc"]
    missions = missions.drop(columns=["action_datetime_utc"])

    # Create mission_actions
    mission_actions_columns = [
        "id",
        "action_type",
        "action_datetime_utc",
        "vessel_id",
        "cfr",
        "ircs",
        "external_immatriculation",
        "vessel_name",
        "latitude",
        "longitude",
        "port_locode",
        "flag_state",
        "facade",
        "district_code",
        "fao_areas",
        "segments",
        "gear_onboard",
        "gear_infractions",
        "species_onboard",
        "species_infractions",
        "logbook_infractions",
        "other_infractions",
        "has_some_gears_seized",
        "has_some_species_seized",
        "seizure_and_diversion",
        "seizure_and_diversion_comments",
        "other_comments",
        "vessel_targeted",
        "open_by",
        "completed_by",
    ]

    mission_actions = controls[mission_actions_columns].copy(deep=True)
    mission_actions["mission_id"] = mission_actions["id"]
    mission_actions["is_from_poseidon"] = True
    mission_actions = mission_actions.rename(columns={"open_by": "user_trigram"})
    mission_actions["feedback_sheet_required"] = False

    # Create missions_control_units
    missions_control_units_columns = ["id", "control_unit_id"]
    missions_control_units = (
        controls[missions_control_units_columns]
        .rename(columns={"id": "mission_id"})
        .copy(deep=True)
    )

    return missions, mission_actions, missions_control_units


@task(checkpoint=False)
def load_missions_and_missions_control_units(
    missions: pd.DataFrame, missions_control_units: pd.DataFrame, loading_mode: str
):
    # In "replace" loading mode, we want to replace all `missions` whose
    # `mission_souce` is `POSEIDON_CNSP`. So we use `mission_source` as the identifier.

    # In "upsert" loading mode, we want to replace only the missions whose `id` is
    # present in the DataFrame. So we use `id` as the identifier.

    assert loading_mode in ("replace", "upsert")
    id_column = "mission_source" if loading_mode == "replace" else "id"

    e = create_engine("monitorenv_remote")
    with e.begin() as connection:
        load(
            missions,
            table_name="missions",
            schema="public",
            connection=connection,
            logger=prefect.context.get("logger"),
            pg_array_columns=["mission_types"],
            how="upsert",
            table_id_column=id_column,
            df_id_column=id_column,
            enum_columns=["mission_source"],
            init_ddls=[
                DDL(
                    "ALTER TABLE public.missions_control_units "
                    "DROP CONSTRAINT missions_control_units_mission_id_fkey;"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_units "
                    "ADD CONSTRAINT missions_control_units_mission_id_cascade_fkey "
                    "FOREIGN KEY (mission_id) "
                    "REFERENCES public.missions (id) "
                    "ON DELETE CASCADE;"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_resources "
                    "DROP CONSTRAINT missions_control_resources_mission_id_fkey;"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_resources "
                    "ADD CONSTRAINT missions_control_resources_mission_id_cascade_fkey "
                    "FOREIGN KEY (mission_id) "
                    "REFERENCES public.missions (id) "
                    "ON DELETE CASCADE;"
                ),
            ],
            end_ddls=[
                DDL(
                    "ALTER TABLE public.missions_control_resources "
                    "DROP CONSTRAINT missions_control_resources_mission_id_cascade_fkey;"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_resources "
                    "ADD CONSTRAINT missions_control_resources_mission_id_fkey "
                    "FOREIGN KEY (mission_id) "
                    "REFERENCES public.missions (id);"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_units "
                    "DROP CONSTRAINT missions_control_units_mission_id_cascade_fkey;"
                ),
                DDL(
                    "ALTER TABLE public.missions_control_units "
                    "ADD CONSTRAINT missions_control_units_mission_id_fkey "
                    "FOREIGN KEY (mission_id) "
                    "REFERENCES public.missions (id);"
                ),
            ],
        )

        load(
            missions_control_units,
            table_name="missions_control_units",
            schema="public",
            connection=connection,
            logger=prefect.context.get("logger"),
            how="append",
        )


@task(checkpoint=False)
def load_mission_actions(mission_actions: pd.DataFrame, loading_mode: str):
    # In "replace" loading mode, we want to replace all `mission_actions` for which
    # `is_from_poseidon` is True. So we use `is_from_poseidon` as the identifier.

    # In "upsert" loading mode, we want to replace only the `mission_actions` whose id
    # is present in the DataFrame. So we use `id` as the identifier.

    assert loading_mode in ("replace", "upsert")
    id_column = "is_from_poseidon" if loading_mode == "replace" else "id"

    load(
        mission_actions,
        table_name="mission_actions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        pg_array_columns=["fao_areas"],
        jsonb_columns=[
            "segments",
            "gear_onboard",
            "species_onboard",
            "gear_infractions",
            "species_infractions",
            "logbook_infractions",
            "other_infractions",
        ],
        how="upsert",
        table_id_column=id_column,
        df_id_column=id_column,
        enum_columns=["action_type"],
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
        segments = extract_all_segments()
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
        (
            missions,
            mission_actions,
            missions_control_units,
        ) = make_missions_actions_and_missions_control_units(controls)

        # Load
        loaded_missions_and_missions_control_units = (
            load_missions_and_missions_control_units(
                missions, missions_control_units, loading_mode=loading_mode
            )
        )

        load_mission_actions(
            mission_actions,
            loading_mode=loading_mode,
            upstream_tasks=[loaded_missions_and_missions_control_units],
        )


flow.file_name = Path(__file__).name
