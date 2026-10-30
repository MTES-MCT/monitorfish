package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingAndOccurrences
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.RiskElementMetrics
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElementAndReportings
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRiskElementRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ReportingEnricher
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.occurrenceDate

@UseCase
class GetVesselRiskElements(
    private val vesselRiskElementRepository: VesselRiskElementRepository,
    private val reportingRepository: ReportingRepository,
    private val infractionRepository: InfractionRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val reportingEnricher = ReportingEnricher(infractionRepository)

    fun execute(cfr: String): List<VesselRiskElementAndReportings> {
        val riskElements = vesselRiskElementRepository.findAllByCfr(cfr)

        val reportingIds =
            riskElements
                .map { it.metrics }
                .filterIsInstance<RiskElementMetrics.Occurrences>()
                .flatMap { it.reportingIds }
        // Reportings deleted since the risk elements computation are not returned
        val reportings = reportingRepository.findAllByIds(reportingIds)
        val controlUnits = if (reportings.isEmpty()) emptyList() else getAllLegacyControlUnits.execute()

        return riskElements.map { riskElement ->
            val metrics = riskElement.metrics
            if (metrics !is RiskElementMetrics.Occurrences) {
                return@map VesselRiskElementAndReportings(riskElement = riskElement, reportings = null)
            }

            val riskElementReportings =
                reportings
                    .filter { it.id in metrics.reportingIds }
                    .sortedByDescending { it.occurrenceDate }
            val lastReporting =
                riskElementReportings.firstOrNull()
                    ?: return@map VesselRiskElementAndReportings(riskElement = riskElement, reportings = null)

            val reportingAndOccurrences =
                reportingEnricher.enrichWithInfractionAndControlUnit(
                    ReportingAndOccurrences(
                        otherOccurrencesOfSameAlert = riskElementReportings.drop(1),
                        reporting = lastReporting,
                        controlUnit = null,
                    ),
                    controlUnits,
                )

            VesselRiskElementAndReportings(riskElement = riskElement, reportings = reportingAndOccurrences)
        }
    }
}
