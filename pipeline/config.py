import os
from pathlib import Path

from dotenv import get_key

PREFECT_API_URL = os.getenv("PREFECT_API_URL")

# Must be set to true when running tests
TEST = os.getenv("TEST", "False").lower() in ("true", "t", "yes", "y")
env_file = ".env.test" if TEST else ".env"

# Package structure
ROOT_DIRECTORY = Path(__file__).parent
DOTENV_PATH = ROOT_DIRECTORY / env_file
LIBRARY_LOCATION = ROOT_DIRECTORY / Path("src")
PIPELINE_DATA_LOCATION = LIBRARY_LOCATION / Path("data")
QUERIES_LOCATION = LIBRARY_LOCATION / Path("queries")
TEST_DATA_LOCATION = ROOT_DIRECTORY / Path("tests/test_data")
LOCAL_MIGRATIONS_FOLDER = str(
    (ROOT_DIRECTORY / Path("../backend/src/main/resources/db/migration")).resolve()
)
# HOST_MIGRATIONS_FOLDER envirionment variable is needed when running tests in CI to
# mount migrations folder from the host to the database container
HOST_MIGRATIONS_FOLDER = os.getenv("HOST_MIGRATIONS_FOLDER") or LOCAL_MIGRATIONS_FOLDER
HOST_ENV_FILE_LOCATION = os.getenv("HOST_ENV_FILE_LOCATION")

EMAIL_TEMPLATES_LOCATION = LIBRARY_LOCATION / Path("emails/templates")
EMAIL_IMAGES_LOCATION = LIBRARY_LOCATION / Path("emails/images")
STATE_FLAGS_ICONS_LOCATION = EMAIL_IMAGES_LOCATION / Path("flags")
CNSP_LOGO_PATH = EMAIL_IMAGES_LOCATION / "logo_cnsp.jpg"
SE_MER_LOGO_PATH = EMAIL_IMAGES_LOCATION / "logo_se_mer.jpg"
CNSP_CROSSA_CACEM_LOGOS_PATH = EMAIL_IMAGES_LOCATION / "logos_cnsp_crossa_cacem.jpg"
MARIANNE_LOGO_PATH = EMAIL_IMAGES_LOCATION / "marianne.gif"
LIBERTE_EGALITE_FRATERNITE_LOGO_PATH = (
    EMAIL_IMAGES_LOCATION / "liberte_egalite_fraternite.gif"
)
EMAIL_FONTS_LOCATION = LIBRARY_LOCATION / Path("emails/fonts")
EMAIL_STYLESHEETS_LOCATION = LIBRARY_LOCATION / Path("emails/stylesheets")
SMS_TEMPLATES_LOCATION = LIBRARY_LOCATION / Path("sms")

# Must be set to true to avoid external side effects (emails, data.gouv uploads...) in
# integration
IS_INTEGRATION = (get_key(DOTENV_PATH, "IS_INTEGRATION") or "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Must be set to true to send prior notifications to the FMC IT dept, and
# not to real addressees (control units)
PNO_TEST_MODE = (get_key(DOTENV_PATH, "PNO_TEST_MODE") or "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Must be set to true to send beacon malfunction notifications to the FMC IT dept, and
# not to real addressees (fishermen, shipowners and satellite operators)
TEST_MODE = (get_key(DOTENV_PATH, "TEST_MODE") or "False").lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Must be set to true to send prior notifications to the FMC, and
# not to real addressees (control units)
WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE = (
    get_key(DOTENV_PATH, "WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE") or "False"
).lower() in (
    "true",
    "t",
    "yes",
    "y",
)

# Flow execution configuration
DOCKER_IMAGE = (
    "docker.pkg.github.com/mtes-mct/monitorfish/monitorfish-pipeline-prefect3"
)
MONITORFISH_VERSION = os.getenv("MONITORFISH_VERSION")
FLOWS_LOCATION = Path("src/flows")  # relative to the WORKDIR in the image
LOGBOOK_FILES_GID = os.getenv("LOGBOOK_FILES_GID")

# Location where ERS xml files can be fetched
ERS_FILES_LOCATION = Path("/opt2/monitorfish-data/ers")

# Proxies for pipeline flows requiring Internet access
PROXIES = {
    "http": get_key(DOTENV_PATH, "HTTP_PROXY_"),
    "https": get_key(DOTENV_PATH, "HTTPS_PROXY_"),
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

FAO_SPECIES_URL = "https://www.fao.org/fishery/static/ASFIS/ASFIS_sp.zip"
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
    "infringement_risk_level": 2,
    "impact_risk_factor": 1,
    "probability_risk_factor": 2,
    "detectability_risk_factor": 2,
    "risk_factor": (
        (2.0 ** risk_factor_coefficients["probability"])
        * (1.0 ** risk_factor_coefficients["impact"])
        * (2 ** risk_factor_coefficients["detectability"])
    ),
}

default_risk_factors["recent_segments_control_priority_level"] = default_risk_factors[
    "control_priority_level"
]
default_risk_factors["recent_segments_impact_risk_factor"] = default_risk_factors[
    "impact_risk_factor"
]
default_risk_factors[
    "recent_segments_detectability_risk_factor"
] = default_risk_factors["detectability_risk_factor"]
default_risk_factors["recent_segments_risk_factor"] = default_risk_factors[
    "risk_factor"
]

default_risk_factors["usual_segments_control_priority_level"] = default_risk_factors[
    "control_priority_level"
]
default_risk_factors["usual_segments_impact_risk_factor"] = default_risk_factors[
    "impact_risk_factor"
]
default_risk_factors["usual_segments_detectability_risk_factor"] = default_risk_factors[
    "detectability_risk_factor"
]
default_risk_factors["usual_segments_risk_factor"] = default_risk_factors["risk_factor"]

# BEACONS MALFUNCTIONS CONFIGURATION
BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA = 4
BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT = 60

# Prior notification verification configuration
RISK_FACTOR_VERIFICATION_THRESHOLD = 2.3
FLAG_STATES_WITHOUT_SYSTEMATIC_VERIFICATION = ["FRA"]

# Missing DEP alerts configuration
MISSING_DEP_TRACK_ANALYSIS_HOURS = 48

# App URL
MONITORFISH_URL = get_key(DOTENV_PATH, "MONITORFISH_URL")  # http://monitor.fish/
BACKOFFICE_REGULATION_URL = MONITORFISH_URL + "backoffice/regulation"

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
PORTS_CACHE_INVALIDATION_ENDPOINT = API_ENDPOINT + "ports/invalidate"

# Backend api key
BACKEND_API_KEY = get_key(DOTENV_PATH, "MONITORFISH_BACKEND_API_KEY")

# Monitorenv endpoint
MONITORENV_URL = get_key(DOTENV_PATH, "MONITORENV_URL")
MONITORENV_API_ENDPOINT = MONITORENV_URL + "api/v2/"

# External endpoints
BATHYMETRY_API_URL = "https://rest.emodnet-bathymetry.eu"
BATHYMETRY_DEPTH_SAMPLE_ENDPOINT = BATHYMETRY_API_URL + "/depth_sample"

# Email server
MONITORFISH_EMAIL_SERVER_URL = get_key(DOTENV_PATH, "MONITORFISH_EMAIL_SERVER_URL")
MONITORFISH_EMAIL_SERVER_PORT = get_key(DOTENV_PATH, "MONITORFISH_EMAIL_SERVER_PORT")
MONITORFISH_EMAIL_ADDRESS = get_key(DOTENV_PATH, "MONITORFISH_EMAIL_ADDRESS")

# SMS server
MONITORFISH_SMS_SERVER_URL = get_key(DOTENV_PATH, "MONITORFISH_SMS_SERVER_URL")
MONITORFISH_SMS_SERVER_PORT = get_key(DOTENV_PATH, "MONITORFISH_SMS_SERVER_PORT")
MONITORFISH_SMS_DOMAIN = get_key(DOTENV_PATH, "MONITORFISH_SMS_DOMAIN")

# Fax server
MONITORFISH_FAX_SERVER_URL = get_key(DOTENV_PATH, "MONITORFISH_FAX_SERVER_URL")
MONITORFISH_FAX_SERVER_PORT = get_key(DOTENV_PATH, "MONITORFISH_FAX_SERVER_PORT")
MONITORFISH_FAX_DOMAIN = get_key(DOTENV_PATH, "MONITORFISH_FAX_DOMAIN")

# Recipients
CNSP_SIP_DEPARTMENT_MOBILE_PHONE = get_key(
    DOTENV_PATH, "CNSP_SIP_DEPARTMENT_MOBILE_PHONE"
)
CNSP_SIP_DEPARTMENT_FAX = get_key(DOTENV_PATH, "CNSP_SIP_DEPARTMENT_FAX")
CNSP_SIP_DEPARTMENT_EMAIL = get_key(DOTENV_PATH, "CNSP_SIP_DEPARTMENT_EMAIL")
PNO_TEST_EMAIL = get_key(DOTENV_PATH, "PNO_TEST_EMAIL")
CNSP_FRANCE_EMAIL_ADDRESS = get_key(DOTENV_PATH, "CNSP_FRANCE_EMAIL_ADDRESS")

# Tokens
LOCATIONIQ_TOKEN = get_key(DOTENV_PATH, "LOCATIONIQ_TOKEN")
GOOGLE_API_TOKEN = get_key(DOTENV_PATH, "GOOGLE_API_TOKEN")

# data.gouv.fr configuration
DATAGOUV_API_ENDPOINT = "https://www.data.gouv.fr/api/1"
DATAGOUV_API_KEY = get_key(DOTENV_PATH, "DATAGOUV_API_KEY")

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
