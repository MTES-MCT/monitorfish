import configparser
import tempfile
from contextlib import contextmanager
from io import BytesIO
from pathlib import Path
from typing import Dict, Generator, List, Optional

from prefect import get_run_logger, task
from sdk_entrepot_gpf.helper.JsonHelper import JsonHelper
from sdk_entrepot_gpf.io.Config import Config
from sdk_entrepot_gpf.io.Dataset import Dataset
from sdk_entrepot_gpf.scripts.resolve import ResolveCli
from sdk_entrepot_gpf.store.Configuration import Configuration
from sdk_entrepot_gpf.store.Offering import Offering
from sdk_entrepot_gpf.store.ProcessingExecution import ProcessingExecution
from sdk_entrepot_gpf.store.StoredData import StoredData
from sdk_entrepot_gpf.store.Upload import Upload
from sdk_entrepot_gpf.workflow.action.UploadAction import UploadAction
from sdk_entrepot_gpf.workflow.Workflow import Workflow

from config import (
    GEOPLATEFORME_API_ROOT_URL,
    GEOPLATEFORME_CLIENT_ID,
    GEOPLATEFORME_CLIENT_SECRET,
    GEOPLATEFORME_DATASTORE_ID,
    GEOPLATEFORME_LOGIN,
    GEOPLATEFORME_PASSWORD,
    GEOPLATEFORME_TOKEN_URL,
    PROXIES,
)


class PrefectOutputManager:
    """
    Routes the `sdk_entrepot_gpf` output to the Prefect run logger.

    The SDK logs everything through `Config().om`, whose default implementation prints to
    stdout. Substituting this class makes the delivery and workflow progress visible in
    the Prefect UI.
    """

    def __init__(self, logger):
        self.logger = logger

    def debug(self, message: str, force_flush: bool = False) -> None:
        self.logger.debug(message)

    def info(
        self, message: str, green_colored: bool = False, force_flush: bool = False
    ) -> None:
        self.logger.info(message)

    def warning(
        self, message: str, yellow_colored: bool = True, force_flush: bool = False
    ) -> None:
        self.logger.warning(message)

    def error(
        self, message: str, red_colored: bool = True, force_flush: bool = False
    ) -> None:
        self.logger.error(message)

    def critical(
        self, message: str, red_colored: bool = True, force_flush: bool = False
    ) -> None:
        self.logger.critical(message)

    def set_log_level(self, level: str) -> None:
        pass

    def _force_flush(self) -> None:
        pass


def escape_interpolation(value: Optional[str]) -> str:
    """
    Escapes the `$` of a configuration value, which the SDK's ExtendedInterpolation
    parser would otherwise expand.
    """
    return (value or "").replace("$", "$$")


def get_sdk_config() -> configparser.ConfigParser:
    """
    Returns the `sdk_entrepot_gpf` configuration to use to connect to the Géoplateforme.

    Only the values that differ from the SDK's bundled `_conf/default.ini` are set.
    A service account is used when a client secret is configured, and the login and
    password otherwise.

    Returns:
        configparser.ConfigParser: SDK configuration
    """
    proxies = {
        "http_proxy": PROXIES["http"] or "",
        "https_proxy": PROXIES["https"] or "",
    }

    if GEOPLATEFORME_CLIENT_SECRET:
        authentification = {
            "grant_type": "client_credentials",
            "client_id": GEOPLATEFORME_CLIENT_ID,
            "client_secret": escape_interpolation(GEOPLATEFORME_CLIENT_SECRET),
        }
    else:
        # `client_id` and `client_secret` are left to the public client shipped in the
        # SDK's default configuration: they identify the SDK itself, not the account.
        authentification = {
            "grant_type": "password",
            "login": GEOPLATEFORME_LOGIN,
            "password": escape_interpolation(GEOPLATEFORME_PASSWORD),
        }

    config = configparser.ConfigParser(interpolation=None)
    config.read_dict(
        {
            "store_authentification": {
                **authentification,
                "token_url": GEOPLATEFORME_TOKEN_URL,
                **proxies,
            },
            "store_api": {
                "datastore": GEOPLATEFORME_DATASTORE_ID,
                "root_url": GEOPLATEFORME_API_ROOT_URL,
                **proxies,
            },
        }
    )
    return config


@contextmanager
def geoplateforme_config() -> Generator[None, None, None]:
    """
    Loads the Géoplateforme credentials into the `sdk_entrepot_gpf` configuration for the
    duration of the context, and routes the SDK output to the Prefect run logger.

    The SDK only accepts a configuration file, so the credentials are written to a
    temporary `.ini` file, which is deleted upon exiting the context.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        config_file_path = Path(tmp_dir) / "config.ini"

        with open(config_file_path, "w", encoding="utf-8") as f:
            get_sdk_config().write(f)

        Config().read(config_file_path)
        Config().set_output_manager(PrefectOutputManager(get_run_logger()))

        yield


@task
def deliver_to_data_store(
    upload_name: str,
    description: str,
    srs: str,
    files: Dict[str, BytesIO],
    tags: Optional[Dict[str, str]],
    comments: Optional[List[str]],
    mock_update: bool,
) -> Optional[Upload]:
    """
    Deliver the given files to the Géoplateforme data store.

    A delivery ("livraison") of the same name is deleted and recreated, so that the data
    store always holds a single, up-to-date delivery under that name.

    Delivering files only uploads them to the data store. To make the data available
    through a published geoservice, run the corresponding workflow step with
    `run_data_store_workflow`.

    Args:
        upload_name (str): name of the delivery on the Géoplateforme
        description (str): description of the delivery
        srs (str): EPSG code of the projection of the data, e.g. `"EPSG:4326"`
        files (Dict[str, BytesIO]): files to deliver, keyed by file name
        tags (Optional[Dict[str, str]]): tags to add to the delivery
        comments (Optional[List[str]]): comments to add to the delivery
        mock_update (bool): if ``True``, nothing is delivered

    Returns:
        Optional[Upload]: the delivery, or ``None`` if `mock_update` is ``True``
    """
    logger = get_run_logger()

    if mock_update:
        logger.info(f"Mocking delivery of {upload_name} to the Géoplateforme")
        return None

    with geoplateforme_config(), tempfile.TemporaryDirectory() as tmp_dir:
        data_directory = Path(tmp_dir) / upload_name
        data_directory.mkdir()

        for file_name, file_object in files.items():
            (data_directory / file_name).write_bytes(file_object.getvalue())

        # `Dataset` takes the same structure as the upload descriptor file documented at
        # https://geoplateforme.github.io/sdk-entrepot/upload_descriptor/, and generates
        # the md5 files in the root directory, hence the temporary directory.
        dataset = Dataset(
            {
                "data_dirs": [upload_name],
                "upload_infos": {
                    "name": upload_name,
                    "description": description,
                    "srs": srs,
                    "type": "VECTOR",
                },
                "comments": comments or [],
                "tags": tags or {},
            },
            Path(tmp_dir),
        )

        logger.info(f"Delivering {upload_name} to the Géoplateforme")
        upload_action = UploadAction(dataset, behavior=UploadAction.BEHAVIOR_DELETE)
        upload = upload_action.run(GEOPLATEFORME_DATASTORE_ID)

        if not UploadAction.monitor_until_end(upload, logger.info):
            raise RuntimeError(
                f"Checks failed on Géoplateforme delivery {upload_name} ({upload.id})."
            )

        return upload


@task
def run_data_store_workflow(
    workflow_file: Path,
    step: str,
    params: Dict[str, str],
    tags: Optional[Dict[str, str]],
    comments: Optional[List[str]],
    mock_update: bool,
):
    """
    Run a step of the given Géoplateforme workflow.

    Args:
        workflow_file (Path): path to the workflow descriptor file
        step (str): name of the step to run
        params (Dict[str, str]): values of the `{params.xxx}` resolvers of the workflow
        tags (Optional[Dict[str, str]]): tags to add to all the actions of the step
        comments (Optional[List[str]]): comments to add to all the actions of the step
        mock_update (bool): if ``True``, the step is not run
    """
    logger = get_run_logger()

    if mock_update:
        logger.info(f"Mocking run of step {step} of workflow {workflow_file}")
        return

    def log_processing_execution(processing_execution: ProcessingExecution) -> None:
        try:
            logger.info(processing_execution.api_logs())
        except Exception:
            logger.info("Logs are not available yet")

    with geoplateforme_config():
        workflow = Workflow(workflow_file.stem, JsonHelper.load(workflow_file))

        errors = workflow.validate()
        if errors:
            raise ValueError(f"Invalid workflow {workflow_file}: {'; '.join(errors)}")

        ResolveCli.init_resolvers(params)

        logger.info(f"Running step {step} of workflow {workflow_file}")
        workflow.run_step(
            step,
            log_processing_execution,
            datastore=GEOPLATEFORME_DATASTORE_ID,
            comments=comments or [],
            tags=tags or {},
        )


@task
def swap_configuration_stored_data(
    configuration_id: str,
    offering_id: str,
    stored_data_name: str,
    mock_update: bool,
) -> Optional[str]:
    """
    Point the given geoservice configuration at the stored data named
    `stored_data_name`, then synchronize the published offering so that the change is
    served.

    The rest of the configuration, in particular the relations that name the table and
    describe the layer, is left untouched.

    Args:
        configuration_id (str): id of the configuration to update
        offering_id (str): id of the offering to synchronize
        stored_data_name (str): name of the stored data to serve
        mock_update (bool): if ``True``, nothing is updated

    Returns:
        Optional[str]: id of the stored data that was served until now, or ``None`` if
          `mock_update` is ``True`` or if the configuration served none
    """
    logger = get_run_logger()

    if mock_update:
        logger.info(f"Mocking swap of configuration {configuration_id}")
        return None

    with geoplateforme_config():
        stored_datas = StoredData.api_list(
            infos_filter={"name": stored_data_name},
            datastore=GEOPLATEFORME_DATASTORE_ID,
        )
        if len(stored_datas) != 1:
            raise RuntimeError(
                f"Expected exactly one stored data named {stored_data_name} on the "
                f"Géoplateforme, found {len(stored_datas)}."
            )
        stored_data_id = stored_datas[0].id

        configuration = Configuration.api_get(
            configuration_id, datastore=GEOPLATEFORME_DATASTORE_ID
        )
        properties = configuration.get_store_properties()
        used_data = properties["type_infos"]["used_data"]

        previous_stored_data_ids = {
            data["stored_data"] for data in used_data if data.get("stored_data")
        }
        for data in used_data:
            data["stored_data"] = stored_data_id

        logger.info(
            f"Pointing configuration {configuration_id} at stored data {stored_data_id}"
        )
        # `edit` merges the change into the current properties before the full update,
        # which the API requires: a partial body is rejected.
        configuration.edit({"type_infos": properties["type_infos"]})

        logger.info(f"Synchronizing offering {offering_id}")
        Offering.api_get(
            offering_id, datastore=GEOPLATEFORME_DATASTORE_ID
        ).api_synchronize()

    previous_stored_data_ids.discard(stored_data_id)
    if len(previous_stored_data_ids) > 1:
        raise RuntimeError(
            f"Configuration {configuration_id} served several stored data "
            f"({previous_stored_data_ids}), refusing to guess which one to remove."
        )

    return previous_stored_data_ids.pop() if previous_stored_data_ids else None


@task
def delete_data_store_stored_data(stored_data_id: Optional[str], mock_update: bool):
    """
    Delete the designated stored data from the Géoplateforme data store.

    Args:
        stored_data_id (Optional[str]): id of the stored data to delete. Nothing is
          deleted if ``None``.
        mock_update (bool): if ``True``, nothing is deleted
    """
    logger = get_run_logger()

    if stored_data_id is None:
        logger.info("No stored data to delete")
        return

    if mock_update:
        logger.info(f"Mocking deletion of stored data {stored_data_id}")
        return

    with geoplateforme_config():
        logger.info(f"Deleting stored data {stored_data_id}")
        StoredData.api_get(
            stored_data_id, datastore=GEOPLATEFORME_DATASTORE_ID
        ).api_delete()
