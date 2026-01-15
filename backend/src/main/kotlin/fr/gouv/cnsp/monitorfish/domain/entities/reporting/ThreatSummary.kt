package fr.gouv.cnsp.monitorfish.domain.entities.reporting

data class ThreatSummary(
    val natinfCode: Int,
    val natinf: String,
    val threatCharacterization: String,
    val numberOfOccurrences: Int,
)
