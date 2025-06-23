from dataclasses import dataclass
from typing import Optional


@dataclass
class FishingGear:
    code: str
    name: str
    mesh: Optional[float] = None


@dataclass
class FleetSegment:
    code: str
    name: str
