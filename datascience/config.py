import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ROOT_DIRECTORY = Path(__file__).parent
LIBRARY_LOCATION = ROOT_DIRECTORY / Path("src")
QUERIES_LOCATION = LIBRARY_LOCATION / Path("pipeline/queries")
TEST_DATA_LOCATION = ROOT_DIRECTORY / Path("tests/test_data")

#
ERS_FILES_LOCATION = Path("/opt2/monitorfish-data/ers")

# Proxies for pipeline flows requiring Internet access
PROXIES = {
    "http": os.environ.get("HTTP_PROXY_"),
    "https": os.environ.get("HTTPS_PROXY_"),
}

# URLs to fetch data from
PORTS_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/60fe965d-5888-493b-9321-24bc3b1f84db"
)

FLEET_SEGMENTS_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/41873d54-278f-4d2a-bdb2-77746c581fac"
)

ISSCAAP_GROUPS_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/d3024324-ff69-429b-848b-945cb8748005"
)

FAO_SPECIES_URL = "http://www.fao.org/fishery/static/ASFIS/ASFIS_sp.zip"
DATA_GOUV_SPECIES_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/32616122-6931-4875-8e26-a57832012419"
)
