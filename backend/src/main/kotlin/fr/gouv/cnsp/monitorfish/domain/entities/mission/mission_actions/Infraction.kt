package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

data class Infraction(
    val infractionType: InfractionType? = null,
    val natinf: Int? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    val comments: String? = null,
)
