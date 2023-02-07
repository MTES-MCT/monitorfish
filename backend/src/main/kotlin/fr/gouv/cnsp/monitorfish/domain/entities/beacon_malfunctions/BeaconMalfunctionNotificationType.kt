package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class BeaconMalfunctionNotificationType {
    MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION,
    MALFUNCTION_AT_SEA_REMINDER,
    MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
    MALFUNCTION_AT_PORT_REMINDER,
    END_OF_MALFUNCTION,
}
