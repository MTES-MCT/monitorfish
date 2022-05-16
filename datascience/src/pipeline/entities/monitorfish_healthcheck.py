from dataclasses import dataclass
from datetime import datetime


@dataclass
class MonitorfishHealthcheck:
    date_position_received: datetime
    date_last_position: datetime
    date_logbook_message_received: datetime

    @staticmethod
    def from_json(data: dict):
        date_format = "%Y-%m-%dT%H:%M:%SZ"

        date_position_received = datetime.strptime(
            data["datePositionReceived"], date_format
        )
        date_last_position = datetime.strptime(data["dateLastPosition"], date_format)
        date_logbook_message_received = datetime.strptime(
            data["dateLogbookMessageReceived"], date_format
        )

        return MonitorfishHealthcheck(
            date_position_received=date_position_received,
            date_last_position=date_last_position,
            date_logbook_message_received=date_logbook_message_received,
        )
