package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class EndOfBeaconMalfunctionReason {
    RESUMED_TRANSMISSION,
    TEMPORARY_INTERRUPTION_OF_FOLLOW_UP,
    PERMANENT_INTERRUPTION_OF_FOLLOW_UP
}