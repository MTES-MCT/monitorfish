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


class InfractionType(Enum):
    WITH_RECORD = "WITH_RECORD"
    WITHOUT_RECORD = "WITHOUT_RECORD"

    def from_poseidon_infraction_field(infraction: int):
        """
        Translates the `infraction` field of the Poseidon database into the
        corresponding InfractionType.

        The `infraction` field of the Poseidon database holds values:

        - 0 for controls without infraction
        - 1 for controls with infraction(s)
        - 2 for controls with infraction(s) but without record ("PV" in french)

        In some rare cases, the `infraction` field has the value 0 although some
        infractions are present in the control results. In these cases, we'll consider
        there was no record.

        Args:
            infraction (int): 0, 1 or 2

        Returns:
            InfractionType
        """
        assert infraction in (0, 1, 2)

        infraction_types = [
            InfractionType.WITHOUT_RECORD,
            InfractionType.WITH_RECORD,
            InfractionType.WITHOUT_RECORD,
        ]

        return infraction_types[infraction]
