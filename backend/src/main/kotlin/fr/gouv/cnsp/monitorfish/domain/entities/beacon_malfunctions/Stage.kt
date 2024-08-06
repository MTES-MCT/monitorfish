package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class Stage {
    INITIAL_ENCOUNTER,
    FOLLOWING,
    FOUR_HOUR_REPORT,
    AT_QUAY,
    TARGETING_VESSEL,
    ARCHIVED,
}
