from enum import Enum


class beaconStatus(Enum):
    ACTIVATED = "ACTIVATED"
    DEACTIVATED = "DEACTIVATED"
    IN_TEST = "IN_TEST"
    NON_APPROVED = "NON_APPROVED"
    UNSUPERVISED = "UNSUPERVISED"

    @staticmethod
    def from_poseidon_status(poseidon_status: str):
        mapping = {
            "Activée": beaconStatus.ACTIVATED,
            "Désactivée": beaconStatus.DEACTIVATED,
            "En test": beaconStatus.IN_TEST,
            "Non agréée": beaconStatus.NON_APPROVED,
            "Non surveillée": beaconStatus.UNSUPERVISED,
        }
        return mapping[poseidon_status]
