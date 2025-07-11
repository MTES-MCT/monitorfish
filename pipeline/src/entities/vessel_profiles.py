from enum import Enum


class VesselProfileType(Enum):
    RECENT = "RECENT"
    USUAL = "USUAL"

    @property
    def duration_in_days(self):
        durations_dict = {
            "RECENT": 14,
            "USUAL": 365,
        }

        return durations_dict[self.name]

    @property
    def vessel_profiles_prefix(self):
        prefix_dict = {
            "RECENT": "recent_",
            "USUAL": "",
        }

        return prefix_dict[self.name]

    @property
    def risk_factors_prefix(self):
        prefix_dict = {
            "RECENT": "recent_",
            "USUAL": "usual_",
        }

        return prefix_dict[self.name]
