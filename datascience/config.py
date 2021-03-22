from pathlib import Path

import prefect

ROOT_DIRECTORY = Path(__file__).parent
LIBRARY_LOCATION = ROOT_DIRECTORY / "src"
ERS_FILES_LOCATION = Path("/opt2/monitorfish-data/ers")
