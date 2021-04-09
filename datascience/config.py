from pathlib import Path

ROOT_DIRECTORY = Path(__file__).parent
LIBRARY_LOCATION = ROOT_DIRECTORY / Path("src")
QUERIES_LOCATION = LIBRARY_LOCATION / Path("pipeline/queries")

#
ERS_FILES_LOCATION = Path("/opt2/monitorfish-data/ers")

# Proxies for pipeline flows requiring Internet access
PROXIES = {
    "http": "http://172.27.229.197:8090",
    "https": "http://172.27.229.197:8090",
}

# URLs to fetch data from
PORTS_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/60fe965d-5888-493b-9321-24bc3b1f84db"
)
FLEET_SEGMENTS_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/41873d54-278f-4d2a-bdb2-77746c581fac"
)
