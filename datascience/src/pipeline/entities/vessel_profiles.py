from enum import Enum


class VesselProfileType(Enum):
    RECENT = "RECENT"
    FULL = "FULL"

    @property
    def duration_in_days(self):
        durations_dict = {
            "RECENT": 14,
            "FULL": 365,
        }

        return durations_dict[self.name]

    @property
    def prefix(self):
        prefix_dict = {
            "RECENT": "recent_",
            "FULL": "",
        }

        return prefix_dict[self.name]
