from datetime import datetime, timezone

import geopandas as gpd
import pandas as pd
from prefect import flow, task

from config import (
    GEOPLATEFORME_WORKFLOWS_LOCATION,
    IS_INTEGRATION,
    REGULATIONS_CSV_RESOURCE_ID,
    REGULATIONS_CSV_RESOURCE_TITLE,
    REGULATIONS_DATASET_ID,
    REGULATIONS_GEOPACKAGE_RESOURCE_ID,
    REGULATIONS_GEOPACKAGE_RESOURCE_TITLE,
    REGULATIONS_GEOPLATEFORME_CONFIGURATION_ID,
    REGULATIONS_GEOPLATEFORME_CSV_FILENAME,
    REGULATIONS_GEOPLATEFORME_DATASHEET_NAME,
    REGULATIONS_GEOPLATEFORME_OFFERING_ID,
    REGULATIONS_GEOPLATEFORME_PRODUCER,
    REGULATIONS_GEOPLATEFORME_SRS,
    REGULATIONS_GEOPLATEFORME_STORED_DATA_NAME,
    REGULATIONS_GEOPLATEFORME_UPLOAD_NAME,
)
from src.generic_tasks import extract
from src.shared_tasks.datagouv import (
    get_csv_file_object,
    get_geopackage_file_object,
    update_resource,
)
from src.shared_tasks.geoplateforme import (
    delete_data_store_stored_data,
    deliver_to_data_store,
    run_data_store_workflow,
    swap_configuration_stored_data,
)


@task
def extract_regulations_open_data() -> gpd.GeoDataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/regulations_open_data.sql",
        backend="geopandas",
        geom_col="geometry",
    )


@task
def get_regulations_for_open_data_csv(regulations: gpd.GeoDataFrame) -> pd.DataFrame:
    columns = [
        "type_de_reglementation",
        "thematique",
        "zone",
        "liste_reglementations",
        "wkt",
    ]

    return pd.DataFrame(regulations[columns])


@task
def get_regulations_for_geoplateforme_csv(
    regulations: gpd.GeoDataFrame,
) -> pd.DataFrame:
    columns = [
        "type_de_reglementation",
        "thematique",
        "zone",
        "periodes",
        "engins",
        "especes",
        "remarques_generales",
        "reglementations",
        "wkt",
    ]

    return pd.DataFrame(regulations[columns])


@task
def get_stored_data_name(base_name: str) -> str:
    """
    Returns the name of the stored data to create for this run. Stored data names must
    be unique, as a new one is created at each run.
    """
    return f"{base_name}_{datetime.now(timezone.utc):%Y%m%dT%H%M%S}"


@task
def get_regulations_for_geopackage(regulations: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    columns = [
        "type_de_reglementation",
        "thematique",
        "zone",
        "liste_reglementations",
        "geometry",
    ]

    # `reglementations` now holds the raw `regulatory_references` json, which a
    # geopackage cannot store. The published resource keeps the aggregated list of
    # references it has always held.
    return (
        regulations[columns]
        .copy(deep=True)
        .rename(columns={"liste_reglementations": "reglementations"})
    )


@flow(name="Monitorfish - Regulations open data")
def regulations_open_data_flow(
    dataset_id: str = REGULATIONS_DATASET_ID,
    csv_resource_id: str = REGULATIONS_CSV_RESOURCE_ID,
    gpkg_resource_id: str = REGULATIONS_GEOPACKAGE_RESOURCE_ID,
    csv_resource_title: str = REGULATIONS_CSV_RESOURCE_TITLE,
    gpkg_resource_title: str = REGULATIONS_GEOPACKAGE_RESOURCE_TITLE,
    geoplateforme_upload_name: str = REGULATIONS_GEOPLATEFORME_UPLOAD_NAME,
    geoplateforme_csv_filename: str = REGULATIONS_GEOPLATEFORME_CSV_FILENAME,
    geoplateforme_stored_data_name: str = REGULATIONS_GEOPLATEFORME_STORED_DATA_NAME,
    geoplateforme_configuration_id: str = REGULATIONS_GEOPLATEFORME_CONFIGURATION_ID,
    geoplateforme_offering_id: str = REGULATIONS_GEOPLATEFORME_OFFERING_ID,
    geoplateforme_datasheet_name: str = REGULATIONS_GEOPLATEFORME_DATASHEET_NAME,
    geoplateforme_producer: str = REGULATIONS_GEOPLATEFORME_PRODUCER,
    geoplateforme_srs: str = REGULATIONS_GEOPLATEFORME_SRS,
    is_integration: bool = IS_INTEGRATION,
):
    regulations = extract_regulations_open_data()

    regulations_for_open_data_csv = get_regulations_for_open_data_csv(regulations)
    regulations_for_geoplateforme_csv = get_regulations_for_geoplateforme_csv(
        regulations
    )
    regulations_for_geopackage = get_regulations_for_geopackage(regulations)

    open_data_csv_file = get_csv_file_object(regulations_for_open_data_csv)
    geoplateforme_csv_file = get_csv_file_object(regulations_for_geoplateforme_csv)
    geopackage_file = get_geopackage_file_object(
        regulations_for_geopackage, layers="type_de_reglementation"
    )

    update_resource(
        dataset_id=dataset_id,
        resource_id=csv_resource_id,
        resource_title=csv_resource_title,
        resource=open_data_csv_file,
        mock_update=is_integration,
    )

    update_resource(
        dataset_id=dataset_id,
        resource_id=gpkg_resource_id,
        resource_title=gpkg_resource_title,
        resource=geopackage_file,
        mock_update=is_integration,
    )

    deliver_to_data_store(
        upload_name=geoplateforme_upload_name,
        description="Réglementation des pêches cartographiée",
        srs=geoplateforme_srs,
        files={geoplateforme_csv_filename: geoplateforme_csv_file},
        tags={"source": "monitorfish"},
        comments=None,
        mock_update=is_integration,
    )

    stored_data_name = get_stored_data_name(geoplateforme_stored_data_name)

    run_data_store_workflow(
        workflow_file=GEOPLATEFORME_WORKFLOWS_LOCATION / "regulations_workflow.jsonc",
        step="creation-base",
        params={
            "upload_name": geoplateforme_upload_name,
            "stored_data_name": stored_data_name,
            "datasheet_name": geoplateforme_datasheet_name,
            "producer": geoplateforme_producer,
            "production_year": str(datetime.now(timezone.utc).year),
        },
        tags=None,
        comments=None,
        mock_update=is_integration,
    )

    previous_stored_data_id = swap_configuration_stored_data(
        configuration_id=geoplateforme_configuration_id,
        offering_id=geoplateforme_offering_id,
        stored_data_name=stored_data_name,
        mock_update=is_integration,
    )

    delete_data_store_stored_data(
        stored_data_id=previous_stored_data_id,
        mock_update=is_integration,
    )
