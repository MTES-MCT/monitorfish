package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

enum class WeightControlMethod(
    val value: String,
) {
    WEIGHING("WEIGHING"),
    CRATE_COUNT("CRATE_COUNT"),
    SAMPLING("SAMPLING"),
    NOT_APPLICABLE("NOT_APPLICABLE"),
}
