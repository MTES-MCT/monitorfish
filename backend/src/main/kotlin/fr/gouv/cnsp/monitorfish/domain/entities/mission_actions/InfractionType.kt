package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

enum class InfractionType(val value: String) {
    WITH_RECORD("WITH_RECORD"),
    WITHOUT_RECORD("WITHOUT_RECORD"),
    PENDING("PENDING"),
}
