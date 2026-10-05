package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

enum class DiscardReason(
    val label: String,
) {
    DIM("de minimis"),
    RET("espèces interdites"),
    DIS("autres rejets"),
}
