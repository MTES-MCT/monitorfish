package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Threat
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ThreatSummary
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.VesselReportings
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Year

class VesselReportingsDataOutput(
    val summary: Map<Threat, List<ThreatSummaryDataOutput>>,
    val current: List<ReportingAndOccurrencesDataOutput>,
    val archived: Map<Year, List<ReportingAndOccurrencesDataOutput>>,
) {
    companion object {
        fun fromCurrentAndArchivedReporting(vesselReportings: VesselReportings) =
            VesselReportingsDataOutput(
                summary =
                    vesselReportings.summary.mapValues { (_, value) ->
                        value.map {
                            ThreatSummaryDataOutput.fromThreatSummary(it)
                        }
                    },
                current =
                    vesselReportings.current.map {
                        ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(
                            it,
                            useThreatHierarchyForForm = true,
                        )
                    },
                archived =
                    vesselReportings.archived.mapValues { (_, reportingAndOccurrences) ->
                        reportingAndOccurrences.map {
                            ReportingAndOccurrencesDataOutput.fromReportingAndOccurrences(it)
                        }
                    },
            )
    }
}

data class ThreatSummaryDataOutput(
    val natinfCode: Int,
    val natinf: String,
    val threatCharacterization: String,
    val numberOfOccurrences: Int,
) {
    companion object {
        fun fromThreatSummary(threatSummary: ThreatSummary) =
            ThreatSummaryDataOutput(
                natinfCode = threatSummary.natinfCode,
                natinf = threatSummary.natinf,
                threatCharacterization = threatSummary.threatCharacterization,
                numberOfOccurrences = threatSummary.numberOfOccurrences,
            )
    }
}
