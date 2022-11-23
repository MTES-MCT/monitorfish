package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class VesselStatus {
    AT_SEA,
    AT_PORT,
    NO_NEWS,
    NEVER_EMITTED,
    ACTIVITY_DETECTED,
    TECHNICAL_STOP,
    ON_SALE,
    SUSPENDED_BECAUSE_UNPAID,
    IN_FOREIGN_EEZ
}
