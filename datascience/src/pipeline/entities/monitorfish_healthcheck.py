from dataclasses import dataclass
from datetime import datetime


@dataclass
class MonitorfishHealthcheck:
    date_last_position_updated_by_prefect: datetime
    date_last_position_received_by_api: datetime
    date_logbook_message_received: datetime

    @staticmethod
    def from_json(data: dict):
        date_format = "%Y-%m-%dT%H:%M:%SZ"

        date_last_position_updated_by_prefect = datetime.strptime(
            data["dateLastPositionUpdatedByPrefect"], date_format
        )
        date_last_position_received_by_api = datetime.strptime(data["dateLastPositionReceivedByAPI"], date_format)
        date_logbook_message_received = datetime.strptime(
            data["dateLogbookMessageReceived"], date_format
        )

        return MonitorfishHealthcheck(
            date_last_position_updated_by_prefect=date_last_position_updated_by_prefect,
            date_last_position_received_by_api=date_last_position_received_by_api,
            date_logbook_message_received=date_logbook_message_received,
        )
