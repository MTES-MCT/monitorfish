from enum import Enum


class AlertType(Enum):
    THREE_MILES_TRAWLING_ALERT = "THREE_MILES_TRAWLING_ALERT"
    FRENCH_EEZ_FISHING_ALERT = "FRENCH_EEZ_FISHING_ALERT"
    TWELVE_MILES_FISHING_ALERT = "TWELVE_MILES_FISHING_ALERT"
    MISSING_DEP_ALERT = "MISSING_DEP_ALERT"
    MISSING_FAR_ALERT = "MISSING_FAR_ALERT"
    MISSING_FAR_48_HOURS_ALERT = "MISSING_FAR_48_HOURS_ALERT"