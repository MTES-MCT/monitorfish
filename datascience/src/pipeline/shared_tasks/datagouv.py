from io import BytesIO

import requests
from prefect import task

from config import DATAGOUV_API_ENDPOINT, DATAGOUV_API_KEY, PROXIES

HEADERS = {
    "X-API-KEY": DATAGOUV_API_KEY,
}


def api_url(path: str):
    return DATAGOUV_API_ENDPOINT + path


@task(checkpoint=False)
def update_resource(
    dataset_id: str, resource_id: str, resource_title: str, resource: BytesIO
):
    url = api_url(f"/datasets/{dataset_id}/resources/{resource_id}/upload/")
    response = requests.post(
        url,
        files={"file": (resource_title, resource)},
        headers=HEADERS,
        proxies=PROXIES,
    )
    response.raise_for_status()
    return response
