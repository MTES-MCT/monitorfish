package fr.gouv.cnsp.monitorfish.domain.entities.infraction

data class InfractionThreatCharacterization(
    val natinfCode: Int,
    val infraction: String,
    val threat: String,
    val threatCharacterization: String,
)
