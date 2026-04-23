package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction

data class InfractionSuspicionThreat(
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    // enriched in the use-case, never persisted
    val infraction: Infraction? = null,
)
