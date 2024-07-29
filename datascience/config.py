import os
from pathlib import Path

from dotenv import load_dotenv

# Package structure
ROOT_DIRECTORY = Path(__file__).parent
LIBRARY_LOCATION = ROOT_DIRECTORY / Path("src")
PIPELINE_DATA_LOCATION = LIBRARY_LOCATION / Path("pipeline/data")
NON_COMMITED_DATA_LOCATION = PIPELINE_DATA_LOCATION / Path("non_commited_data")
QUERIES_LOCATION = LIBRARY_LOCATION / Path("pipeline/queries")
TEST_DATA_LOCATION = ROOT_DIRECTORY / Path("tests/test_data")
LOCAL_MIGRATIONS_FOLDER = str(
    (ROOT_DIRECTORY / Path("../backend/src/main/resources/db/migration")).resolve()
)
# HOST_MIGRATIONS_FOLDER envirionment variable is needed when running tests in CI to
# mount migrations folder from the host to the database container
HOST_MIGRATIONS_FOLDER = os.getenv("HOST_MIGRATIONS_FOLDER", LOCAL_MIGRATIONS_FOLDER)

EMAIL_TEMPLATES_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/templates")
EMAIL_IMAGES_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/images")
STATE_FLAGS_ICONS_LOCATION = EMAIL_IMAGES_LOCATION / Path("flags")
CNSP_LOGO_PATH = EMAIL_IMAGES_LOCATION / "logo_cnsp.jpg"
SE_MER_LOGO_PATH = EMAIL_IMAGES_LOCATION / "logo_se_mer.jpg"
CNSP_CROSSA_CACEM_LOGOS_PATH = EMAIL_IMAGES_LOCATION / "logos_cnsp_crossa_cacem.jpg"
MARIANNE_LOGO_PATH = EMAIL_IMAGES_LOCATION / "marianne.gif"
LIBERTE_EGALITE_FRATERNITE_LOGO_PATH = (
    EMAIL_IMAGES_LOCATION / "liberte_egalite_fraternite.gif"
)
EMAIL_FONTS_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/fonts")
EMAIL_STYLESHEETS_LOCATION = LIBRARY_LOCATION / Path("pipeline/emails/stylesheets")
SMS_TEMPLATES_LOCATION = LIBRARY_LOCATION / Path("pipeline/sms")

# Must be set to true when running tests locally
TEST_LOCAL = os.getenv("TEST_LOCAL", "False").lower() in ("true", "t", "yes", "y")
if TEST_LOCAL:
    load_dotenv(ROOT_DIRECTORY / ".env.test")

# Must be set to true when running flows locally
RUN_LOCAL = os.getenv("RUN_LOCAL", "False").lower() in ("true", "t", "yes", "y")
if RUN_LOCAL:
    load_dotenv(ROOT_DIRECTORY / ".env")

# Must be set to true to avoid external side effects (emails, data.gouv uploads...) in
# integration
IS_INTEGRATION = os.getenv("IS_INTEGRATION", "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Must be set to true to send prior notifications to the FMC IT dept, and
# not to real addressees (control units)
PNO_TEST_MODE = os.getenv("PNO_TEST_MODE", "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Must be set to true to send beacon malfunction notifications to the FMC IT dept, and
# not to real addressees (fishermen, shipowners and satellite operators)
TEST_MODE = os.getenv("TEST_MODE", "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Flow execution configuration
DOCKER_IMAGE = "docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline"
MONITORFISH_VERSION = os.getenv("MONITORFISH_VERSION")
FLOWS_LOCATION = Path("src/pipeline/flows")  # relative to the WORKDIR in the image
FLOWS_LABEL = "monitorfish"
MAX_FLOW_RUN_MINUTES = 50
FLOW_STATES_TO_CLEAN = ["Running"]
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
    "https://www.fao.org/fishery/geoserver/fifao/ows?"
    "service=WFS&request=GetFeature&version=1.0.0&"
    "typeName=fifao:FAO_AREAS_CWP_NOCOASTLINE&outputFormat=json"
)

# Anchorages config
ANCHORAGES_H3_CELL_RESOLUTION = 9

# Last_positions configuration
CURRENT_POSITION_ESTIMATION_MAX_HOURS = 2.0

# Fishing detection configuration
MIN_FISHING_SPEED_THRESHOLD = 0.025
MAX_FISHING_SPEED_THRESHOLD = 5.5
MINIMUM_CONSECUTIVE_POSITIONS = 2
MINIMUM_MINUTES_OF_EMISSION_AT_SEA = 60

# Historic controls configuration
POSEIDON_CONTROL_ID_TO_MONITORENV_MISSION_ID_SHIFT = -200000

# Vessels configuration
UNKNOWN_VESSEL_ID = -1

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
BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT = 60

# Prior notification verification configuration
RISK_FACTOR_VERIFICATION_THRESHOLD = 2.3
FLAG_STATES_WITHOUT_SYSTEMATIC_VERIFICATION = ["FRA"]

# App URL
MONITORFISH_URL = os.getenv("MONITORFISH_URL")  # http://monitor.fish/
BACKOFFICE_REGULATION_URL = MONITORFISH_URL + "backoffice/regulation"

# Prefect Server endpoint
PREFECT_SERVER_URL = os.getenv("PREFECT_SERVER_URL")

# Backend endpoints
API_ENDPOINT = MONITORFISH_URL + "api/v1/"
BEACON_MALFUNCTIONS_ENDPOINT = API_ENDPOINT + "beacon_malfunctions/"
HEALTHCHECK_ENDPOINT = API_ENDPOINT + "healthcheck"
PENDING_ALERT_VALIDATION_ENDPOINT_TEMPLATE = (
    API_ENDPOINT + "operational_alerts/{pending_alert_id}/validate"
)
REPORTING_ARCHIVING_ENDPOINT_TEMPLATE = (
    API_ENDPOINT + "reportings/{reporting_id}/archive"
)

# Backend api key
BACKEND_API_KEY = os.environ.get("MONITORFISH_BACKEND_API_KEY")

# Monitorenv endpoint
MONITORENV_URL = os.environ.get("MONITORENV_URL")
MONITORENV_API_ENDPOINT = MONITORENV_URL + "api/v2/"

# Email server
MONITORFISH_EMAIL_SERVER_URL = os.environ.get("MONITORFISH_EMAIL_SERVER_URL")
MONITORFISH_EMAIL_SERVER_PORT = os.environ.get("MONITORFISH_EMAIL_SERVER_PORT")
MONITORFISH_EMAIL_ADDRESS = os.environ.get("MONITORFISH_EMAIL_ADDRESS")

# SMS server
MONITORFISH_SMS_SERVER_URL = os.environ.get("MONITORFISH_SMS_SERVER_URL")
MONITORFISH_SMS_SERVER_PORT = os.environ.get("MONITORFISH_SMS_SERVER_PORT")
MONITORFISH_SMS_DOMAIN = os.environ.get("MONITORFISH_SMS_DOMAIN")

# Fax server
MONITORFISH_FAX_SERVER_URL = os.environ.get("MONITORFISH_FAX_SERVER_URL")
MONITORFISH_FAX_SERVER_PORT = os.environ.get("MONITORFISH_FAX_SERVER_PORT")
MONITORFISH_FAX_DOMAIN = os.environ.get("MONITORFISH_FAX_DOMAIN")

# Recipients
CNSP_SIP_DEPARTMENT_MOBILE_PHONE = os.environ.get("CNSP_SIP_DEPARTMENT_MOBILE_PHONE")
CNSP_SIP_DEPARTMENT_FAX = os.environ.get("CNSP_SIP_DEPARTMENT_FAX")
CNSP_SIP_DEPARTMENT_EMAIL = os.environ.get("CNSP_SIP_DEPARTMENT_EMAIL")
PNO_TEST_EMAIL = os.environ.get("PNO_TEST_EMAIL")
CNSP_FRANCE_EMAIL_ADDRESS = os.environ.get("CNSP_FRANCE_EMAIL_ADDRESS")

# Tokens
LOCATIONIQ_TOKEN = os.getenv("LOCATIONIQ_TOKEN")
GOOGLE_API_TOKEN = os.getenv("GOOGLE_API_TOKEN")

# data.gouv.fr configuration
DATAGOUV_API_ENDPOINT = "https://www.data.gouv.fr/api/1"
DATAGOUV_API_KEY = os.getenv("DATAGOUV_API_KEY")

# data.gouv.fr resource ids
REGULATIONS_DATASET_ID = "60c0ad5b8d17ba18c7b17bd0"
REGULATIONS_CSV_RESOURCE_ID = "67578d0c-92d4-44b4-8405-34ade40742aa"
REGULATIONS_GEOPACKAGE_RESOURCE_ID = "12d32a68-e245-4e19-9215-7d07c699b6c0"
REGULATIONS_CSV_RESOURCE_TITLE = "reglementation-des-peches-cartographiee.csv"
REGULATIONS_GEOPACKAGE_RESOURCE_TITLE = "reglementation-des-peches-cartographiee.gpkg"

CONTROLS_STATISTICS_DATASET_ID = "637c9225bad9521cdab12ba2"
CONTROLS_STATISTICS_CSV_RESOURCE_ID = "e370fae2-9397-4fbd-bdc9-4f574b49d503"
CONTROLS_STATISTICS_CSV_RESOURCE_TITLE = "statistiques-de-controle-des-peches.csv"
FLEET_SEGMENTS_CSV_RESOURCE_ID = "d6d6376b-2412-4910-95a5-0f615c1c23aa"
FLEET_SEGMENTS_CSV_RESOURCE_TITLE = "segments-de-flotte.csv"

PORTS_DATASET_ID = "6059e5d28e0833ba3e385aa3"
PORTS_CSV_RESOURCE_ID = "60fe965d-5888-493b-9321-24bc3b1f84db"
PORTS_CSV_RESOURCE_TITLE = "ports.csv"
