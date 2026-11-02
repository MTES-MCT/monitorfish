package fr.gouv.cnsp.monitorfish.domain.entities.risk_element

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingAndOccurrences

data class VesselRiskElementAndReportings(
    val riskElement: VesselRiskElement,
    /** The last reporting of the risk element and its other occurrences, when it is computed from reportings */
    val reportings: ReportingAndOccurrences?,
)
