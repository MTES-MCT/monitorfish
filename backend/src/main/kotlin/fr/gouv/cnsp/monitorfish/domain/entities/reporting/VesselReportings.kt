package fr.gouv.cnsp.monitorfish.domain.entities.reporting

typealias Year = Int
typealias Threat = String

class VesselReportings(
    val summary: Map<Threat, List<ThreatSummary>>,
    val current: List<ReportingAndOccurrences>,
    val archived: Map<Year, List<ReportingAndOccurrences>>,
)
