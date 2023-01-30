from enum import Enum


class MissionActionType(Enum):
    SEA_CONTROL = "SEA_CONTROL"
    LAND_CONTROL = "LAND_CONTROL"
    AIR_SURVEILLANCE = "AIR_SURVEILLANCE"
    AIR_CONTROL = "AIR_CONTROL"

    @staticmethod
    def from_poseidon_control_type(poseidon_control_type: str):
        mapping = {
            "Contrôle à la mer": MissionActionType.SEA_CONTROL,
            "Contrôle à la débarque": MissionActionType.LAND_CONTROL,
            "Contrôle aérien": MissionActionType.AIR_CONTROL,
        }
        return mapping[poseidon_control_type]


class MissionOrigin(Enum):
    POSEIDON_CNSP = "POSEIDON_CNSP"
    POSEIDON_CACEM = "POSEIDON_CACEM"
    MONITORFISH = "MONITORFISH"
    MONITORENV = "MONITORENV"


class MissionType(Enum):
    SEA = "SEA"
    LAND = "LAND"
    AIR = "AIR"

    @staticmethod
    def from_mission_action_type(mission_action_type: MissionActionType):
        mapping = {
            MissionActionType.SEA_CONTROL: MissionType.SEA,
            MissionActionType.LAND_CONTROL: MissionType.LAND,
            MissionActionType.AIR_CONTROL: MissionType.AIR,
        }
        return mapping[mission_action_type]
