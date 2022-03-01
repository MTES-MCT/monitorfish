package fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions

enum class Stage {
    INITIAL_ENCOUNTER,
    FOUR_HOUR_REPORT,
    RELAUNCH_REQUEST,
    TARGETING_VESSEL,
    CROSS_CHECK,
    RESUMED_TRANSMISSION,
    END_OF_FOLLOW_UP
}
