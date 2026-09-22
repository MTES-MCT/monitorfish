import configparser
from io import BytesIO
from pathlib import Path
from unittest.mock import DEFAULT, Mock, patch

import pytest
from prefect.logging import disable_run_logger
from sdk_entrepot_gpf.helper.JsonHelper import JsonHelper
from sdk_entrepot_gpf.workflow.Workflow import Workflow

from config import GEOPLATEFORME_WORKFLOWS_LOCATION
from src.shared_tasks.geoplateforme import (
    delete_data_store_stored_data,
    deliver_to_data_store,
    geoplateforme_config,
    get_sdk_config,
    run_data_store_workflow,
    swap_configuration_stored_data,
)

REGULATIONS_WORKFLOW_FILE = (
    GEOPLATEFORME_WORKFLOWS_LOCATION / "regulations_workflow.jsonc"
)


def test_get_sdk_config():
    config = get_sdk_config()

    # Without a client secret, the SDK's own public client is used to authenticate the
    # account, so neither `client_id` nor `client_secret` is overridden.
    assert config["store_authentification"] == {
        "grant_type": "password",
        "login": "geoplateforme_login",
        "password": "geoplateforme_password",
        "token_url": (
            "https://sso.geopf.fr/realms/geoplateforme/protocol/openid-connect/token"
        ),
        "http_proxy": "http://some.ip.address:port",
        "https_proxy": "http://some.ip.address:port",
    }

    assert config["store_api"] == {
        "datastore": "geoplateforme_datastore_id",
        "root_url": "https://data.geopf.fr/api",
        "http_proxy": "http://some.ip.address:port",
        "https_proxy": "http://some.ip.address:port",
    }


@patch("src.shared_tasks.geoplateforme.GEOPLATEFORME_CLIENT_ID", "some_client_id")
@patch(
    "src.shared_tasks.geoplateforme.GEOPLATEFORME_CLIENT_SECRET", "some_client_secret"
)
def test_get_sdk_config_with_a_service_account():
    config = get_sdk_config()

    assert config["store_authentification"] == {
        "grant_type": "client_credentials",
        "client_id": "some_client_id",
        "client_secret": "some_client_secret",
        "token_url": (
            "https://sso.geopf.fr/realms/geoplateforme/protocol/openid-connect/token"
        ),
        "http_proxy": "http://some.ip.address:port",
        "https_proxy": "http://some.ip.address:port",
    }


@patch("src.shared_tasks.geoplateforme.GEOPLATEFORME_PASSWORD", "a$password")
def test_get_sdk_config_escapes_interpolation_characters():
    # The SDK reads the configuration with an ExtendedInterpolation parser, which would
    # otherwise try to expand the `$`.
    config = get_sdk_config()

    assert config["store_authentification"]["password"] == "a$$password"


@patch("src.shared_tasks.geoplateforme.Config")
def test_geoplateforme_config_writes_then_removes_the_credentials(mock_config):
    config_file_paths = []

    mock_config.return_value.read.side_effect = config_file_paths.append

    with disable_run_logger():
        with geoplateforme_config():
            (config_file_path,) = config_file_paths
            assert config_file_path.exists()

            config = configparser.ConfigParser(interpolation=None)
            config.read(config_file_path, encoding="utf-8")

            assert config["store_authentification"]["login"] == "geoplateforme_login"
            assert config["store_api"]["datastore"] == "geoplateforme_datastore_id"

    assert not config_file_path.exists()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.UploadAction")
@patch("src.shared_tasks.geoplateforme.Dataset")
def test_deliver_to_data_store(mock_dataset, mock_upload_action, mock_config):
    delivered_files = {}

    def record_delivered_files(dataset, root_directory):
        for file_path in Path(root_directory).rglob("*"):
            if file_path.is_file():
                file_name = str(file_path.relative_to(root_directory))
                delivered_files[file_name] = file_path.read_bytes()

        return DEFAULT

    mock_dataset.side_effect = record_delivered_files
    mock_upload_action.BEHAVIOR_DELETE = "DELETE"
    mock_upload_action.monitor_until_end.return_value = True

    with disable_run_logger():
        upload = deliver_to_data_store.fn(
            upload_name="some-upload",
            description="Some description",
            srs="EPSG:4326",
            files={"some-file.csv": BytesIO(b"a,b\n1,2\n")},
            tags={"source": "monitorfish"},
            comments=["Some comment"],
            mock_update=False,
        )

    dataset, root_directory = mock_dataset.call_args.args

    assert dataset == {
        "data_dirs": ["some-upload"],
        "upload_infos": {
            "name": "some-upload",
            "description": "Some description",
            "srs": "EPSG:4326",
            "type": "VECTOR",
        },
        "comments": ["Some comment"],
        "tags": {"source": "monitorfish"},
    }

    assert delivered_files == {"some-upload/some-file.csv": b"a,b\n1,2\n"}

    mock_upload_action.assert_called_once_with(
        mock_dataset.return_value, behavior="DELETE"
    )
    mock_upload_action.return_value.run.assert_called_once_with(
        "geoplateforme_datastore_id"
    )
    assert upload is mock_upload_action.return_value.run.return_value

    # The temporary directory holding the data and the generated md5 files is removed
    assert not Path(root_directory).exists()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.UploadAction")
@patch("src.shared_tasks.geoplateforme.Dataset")
def test_deliver_to_data_store_raises_when_checks_fail(
    mock_dataset, mock_upload_action, mock_config
):
    mock_upload_action.monitor_until_end.return_value = False

    with disable_run_logger():
        with pytest.raises(RuntimeError):
            deliver_to_data_store.fn(
                upload_name="some-upload",
                description="Some description",
                srs="EPSG:4326",
                files={"some-file.csv": BytesIO(b"a,b\n1,2\n")},
                tags=None,
                comments=None,
                mock_update=False,
            )


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.UploadAction")
@patch("src.shared_tasks.geoplateforme.Dataset")
def test_deliver_to_data_store_when_mock_update_is_true(
    mock_dataset, mock_upload_action, mock_config
):
    with disable_run_logger():
        upload = deliver_to_data_store.fn(
            upload_name="some-upload",
            description="Some description",
            srs="EPSG:4326",
            files={"some-file.csv": BytesIO(b"a,b\n1,2\n")},
            tags=None,
            comments=None,
            mock_update=True,
        )

    assert upload is None
    mock_upload_action.assert_not_called()
    mock_dataset.assert_not_called()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.ResolveCli")
@patch("src.shared_tasks.geoplateforme.Workflow")
def test_run_data_store_workflow(mock_workflow, mock_resolve_cli, mock_config):
    mock_workflow.return_value.validate.return_value = []
    params = {"upload_name": "some-upload", "stored_data_name": "some-stored-data"}

    with disable_run_logger():
        run_data_store_workflow.fn(
            workflow_file=REGULATIONS_WORKFLOW_FILE,
            step="creation-base",
            params=params,
            tags=None,
            comments=None,
            mock_update=False,
        )

    mock_resolve_cli.init_resolvers.assert_called_once_with(params)

    assert mock_workflow.return_value.run_step.call_count == 1
    args, kwargs = mock_workflow.return_value.run_step.call_args
    assert args[0] == "creation-base"
    assert kwargs == {
        "datastore": "geoplateforme_datastore_id",
        "comments": [],
        "tags": {},
    }


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.Workflow")
def test_run_data_store_workflow_raises_when_the_workflow_is_invalid(
    mock_workflow, mock_config
):
    mock_workflow.return_value.validate.return_value = ["Some error"]

    with disable_run_logger():
        with pytest.raises(ValueError):
            run_data_store_workflow.fn(
                workflow_file=REGULATIONS_WORKFLOW_FILE,
                step="creation-base",
                params={},
                tags=None,
                comments=None,
                mock_update=False,
            )

    mock_workflow.return_value.run_step.assert_not_called()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.Workflow")
def test_run_data_store_workflow_when_mock_update_is_true(mock_workflow, mock_config):
    with disable_run_logger():
        run_data_store_workflow.fn(
            workflow_file=REGULATIONS_WORKFLOW_FILE,
            step="creation-base",
            params={},
            tags=None,
            comments=None,
            mock_update=True,
        )

    mock_workflow.assert_not_called()


def test_regulations_workflow_is_valid():
    workflow = Workflow(
        REGULATIONS_WORKFLOW_FILE.stem, JsonHelper.load(REGULATIONS_WORKFLOW_FILE)
    )

    assert workflow.validate() == []
    assert workflow.steps == ["creation-base"]


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.Offering")
@patch("src.shared_tasks.geoplateforme.Configuration")
@patch("src.shared_tasks.geoplateforme.StoredData")
def test_swap_configuration_stored_data(
    mock_stored_data, mock_configuration, mock_offering, mock_config
):
    mock_stored_data.api_list.return_value = [Mock(id="new-stored-data")]
    configuration = mock_configuration.api_get.return_value
    configuration.get_store_properties.return_value = {
        "type_infos": {
            "used_data": [
                {
                    "stored_data": "old-stored-data",
                    "relations": [{"native_name": "some_table"}],
                }
            ]
        }
    }

    with disable_run_logger():
        previous = swap_configuration_stored_data.fn(
            configuration_id="some-configuration",
            offering_id="some-offering",
            stored_data_name="some-stored-data",
            mock_update=False,
        )

    assert previous == "old-stored-data"

    # The relations describing the layer must survive the swap.
    configuration.edit.assert_called_once_with(
        {
            "type_infos": {
                "used_data": [
                    {
                        "stored_data": "new-stored-data",
                        "relations": [{"native_name": "some_table"}],
                    }
                ]
            }
        }
    )
    mock_offering.api_get.return_value.api_synchronize.assert_called_once_with()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.StoredData")
def test_swap_configuration_stored_data_raises_when_the_name_is_ambiguous(
    mock_stored_data, mock_config
):
    mock_stored_data.api_list.return_value = [Mock(id="a"), Mock(id="b")]

    with disable_run_logger():
        with pytest.raises(RuntimeError):
            swap_configuration_stored_data.fn(
                configuration_id="some-configuration",
                offering_id="some-offering",
                stored_data_name="some-stored-data",
                mock_update=False,
            )


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.StoredData")
def test_delete_data_store_stored_data(mock_stored_data, mock_config):
    with disable_run_logger():
        delete_data_store_stored_data.fn(
            stored_data_id="some-stored-data", mock_update=False
        )
    mock_stored_data.api_get.return_value.api_delete.assert_called_once_with()


@patch("src.shared_tasks.geoplateforme.Config")
@patch("src.shared_tasks.geoplateforme.StoredData")
def test_delete_data_store_stored_data_without_id(mock_stored_data, mock_config):
    with disable_run_logger():
        delete_data_store_stored_data.fn(stored_data_id=None, mock_update=False)
    mock_stored_data.api_get.assert_not_called()
