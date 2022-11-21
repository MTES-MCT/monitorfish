package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class Stage {
    INITIAL_ENCOUNTER,
    FOUR_HOUR_REPORT,
    RELAUNCH_REQUEST,
    TARGETING_VESSEL,
    END_OF_MALFUNCTION,
    ARCHIVED
}
