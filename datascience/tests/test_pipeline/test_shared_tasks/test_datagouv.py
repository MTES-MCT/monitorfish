from io import BytesIO
from unittest.mock import patch

from src.pipeline.shared_tasks.datagouv import api_url, update_resource


def test_api_url():
    assert api_url("/some/path/") == "https://www.data.gouv.fr/api/1/some/path/"


@patch("src.pipeline.shared_tasks.datagouv.requests")
def test_update_resource(mock_requests):

    resource = BytesIO(b"some file object")

    update_resource.run(
        dataset_id="123",
        resource_id="666",
        resource_title="File title",
        resource=resource,
    )

    assert len(mock_requests.method_calls) == 1

    mock_requests.post.assert_called_once_with(
        "https://www.data.gouv.fr/api/1/datasets/123/resources/666/upload/",
        files={"file": ("File title", resource)},
        headers={"X-API-KEY": "datagouv_api_key"},
        proxies={
            "http": "http://some.ip.address:port",
            "https": "http://some.ip.address:port",
        },
    )
