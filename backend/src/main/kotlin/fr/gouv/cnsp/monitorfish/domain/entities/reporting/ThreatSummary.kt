package fr.gouv.cnsp.monitorfish.domain.entities.reporting

data class InfractionSummary(
    val infractionSuspicionsSummary: List<ReportingTitleAndNumberOfOccurrences>,
    val threatCharacterization: String,
    val numberOfOccurrences: Int,
)
