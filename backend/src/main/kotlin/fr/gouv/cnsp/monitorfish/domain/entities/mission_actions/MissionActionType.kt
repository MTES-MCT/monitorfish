package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

enum class MissionActionType(val value: String) {
    SEA_CONTROL("SEA_CONTROL"),
    LAND_CONTROL("LAND_CONTROL"),
    AIR_CONTROL("AIR_CONTROL"),
    AIR_SURVEILLANCE("AIR_SURVEILLANCE"),
    OBSERVATION("OBSERVATION"),
}
