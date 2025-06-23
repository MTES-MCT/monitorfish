from dataclasses import dataclass
from datetime import datetime


@dataclass
class FlowRun:
    flow_run_id: str
    flow_name: str
    state: str
    state_timestamp: datetime
