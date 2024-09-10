package fr.gouv.cnsp.monitorfish.domain.entities.reporting

data class ReportingSummary(
    val infractionSuspicionsSummary: List<ReportingTitleAndNumberOfOccurrences>,
    val numberOfInfractionSuspicions: Int,
    val numberOfObservations: Int,
)
