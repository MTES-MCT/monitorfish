package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

enum class FlightGoal(val value: String) {
    VMS_AIS_CHECK("VMS_AIS_CHECK"),
    UNAUTHORIZED_FISHING("UNAUTHORIZED_FISHING"),
    CLOSED_AREA("CLOSED_AREA"),
}
