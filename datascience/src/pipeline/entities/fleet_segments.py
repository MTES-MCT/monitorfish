from dataclasses import dataclass


@dataclass
class FishingGear:
    code: str
    name: str
    mesh: float = None


@dataclass
class FleetSegment:
    code: str
    name: str
