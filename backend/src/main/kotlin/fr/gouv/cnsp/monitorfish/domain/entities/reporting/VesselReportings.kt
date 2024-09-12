package fr.gouv.cnsp.monitorfish.domain.entities.reporting

typealias Year = Int

class VesselReportings(
    val summary: ReportingSummary,
    val current: List<ReportingAndOccurrences>,
    val archived: Map<Year, List<ReportingAndOccurrences>>,
)
