import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Package structure
ROOT_DIRECTORY = Path(__file__).parent
LIBRARY_LOCATION = ROOT_DIRECTORY / Path("src")
QUERIES_LOCATION = LIBRARY_LOCATION / Path("pipeline/queries")
TEST_DATA_LOCATION = ROOT_DIRECTORY / Path("tests/test_data")
EMAIL_TEMPLATES_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/templates")
EMAIL_STYLESHEETS_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/stylesheets")

# Flow execution configuration
DOCKER_IMAGE = "docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline"
MONITORFISH_VERSION = os.getenv("MONITORFISH_VERSION")
FLOWS_LOCATION = Path("src/pipeline/flows")  # relative to the WORKDIR in the image
LOGBOOK_FILES_GID = os.getenv("LOGBOOK_FILES_GID")

# Location where ERS xml files can be fetched
ERS_FILES_LOCATION = Path("/opt2/monitorfish-data/ers")

# Proxies for pipeline flows requiring Internet access
PROXIES = {
    "http": os.environ.get("HTTP_PROXY_"),
    "https": os.environ.get("HTTPS_PROXY_"),
}

# URLs to fetch data from
ANCHORAGES_URL = (
    "https://www.data.gouv.fr/fr/datasets/r/e21a667e-bb25-4719-83f5-4b9ba441e93d"
)

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

FAO_AREAS_URL = (
    "http://www.fao.org/fishery/geoserver/fifao/ows?"
    "service=WFS&request=GetFeature&version=1.0.0&"
    "typeName=fifao:FAO_AREAS_CWP&outputFormat=SHAPE-ZIP"
)

# Anchorages config
ANCHORAGES_H3_CELL_RESOLUTION = 9

# Last_positions configuration
CURRENT_POSITION_ESTIMATION_MAX_HOURS = 2.0

# Fishing detection configuration
FISHING_SPEED_THRESHOLD = 4.5
MINIMUM_CONSECUTIVE_POSITIONS = 3

# Risk factor configuration
risk_factor_coefficients = {
    "probability": 0.3,
    "impact": 0.2,
    "detectability": 0.5,
}

default_risk_factors = {
    "control_rate_risk_factor": 4,
    "infraction_rate_risk_factor": 2,
    "control_priority_level": 1,
    "impact_risk_factor": 1,
    "probability_risk_factor": 2,
    "detectability_risk_factor": 2,
    "risk_factor": (
        (2.0 ** risk_factor_coefficients["probability"])
        * (1.0 ** risk_factor_coefficients["impact"])
        * (2 ** risk_factor_coefficients["detectability"])
    ),
}

# BEACONS MALFUNCTIONS CONFIGURATION
BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA = 6
BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT = 24

# App URL
MONITORFISH_HOST = os.getenv("MONITORFISH_HOST")  # monitor.fish
MONITORFISH_IP = os.getenv("MONITORFISH_IP")  # 1.2.3.4
MONITORFISH_URL = os.getenv("MONITORFISH_URL")  # http://monitor.fish/
BACKOFFICE_URL = MONITORFISH_URL + "backoffice/"

# Backend endpoints
BFF_ENDPOINT = MONITORFISH_URL + "bff/v1/"
BEACON_MALFUNCTIONS_ENDPOINT = BFF_ENDPOINT + "beacon_malfunctions/"

# Flows healthcheck URL
FLOWS_HEALTHCHECK_URL = "http://localhost:8085"

# Email server
MONITORFISH_EMAIL_SERVER_URL = os.environ.get("MONITORFISH_EMAIL_SERVER_URL")
MONITORFISH_EMAIL_SERVER_PORT = os.environ.get("MONITORFISH_EMAIL_SERVER_PORT")
MONITORFISH_EMAIL_ADDRESS = os.environ.get("MONITORFISH_EMAIL_ADDRESS")

# Recipients
CNSP_FRANCE_EMAIL_ADDRESS = os.environ.get("CNSP_FRANCE_EMAIL_ADDRESS")
