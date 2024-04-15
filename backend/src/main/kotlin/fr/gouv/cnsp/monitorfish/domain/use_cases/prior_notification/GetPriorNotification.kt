package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetPriorNotification(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(logbookMessageReportId: String): PriorNotification {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val priorNotificationWithoutReportingsCount = logbookReportRepository
            .findPriorNotificationByReportId(logbookMessageReportId)
            .let { priorNotification ->
                val port = try {
                    priorNotification.logbookMessageTyped.typedMessage.port?.let { portLocode ->
                        allPorts.find { it.locode == portLocode }
                    }
                } catch (e: CodeNotFoundException) {
                    null
                }

                // Default to UNKNOWN vessel when null or not found
                val vessel = priorNotification.logbookMessageTyped.logbookMessage
                    .internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                        allVessels.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                    } ?: Vessel(id = -1, flagState = CountryCode.UNDEFINED)

                val vesselRiskFactor = vessel.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                    allRiskFactors.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                }

                val finalPriorNotification = priorNotification.copy(
                    port = port,
                    seaFront = port?.facade,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )

                finalPriorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                finalPriorNotification
            }

        val priorNotification = enrichPriorNotificationWithReportingCount(priorNotificationWithoutReportingsCount)

        return priorNotification
    }

    private fun enrichPriorNotificationWithReportingCount(priorNotification: PriorNotification): PriorNotification {
        val currentReportings = priorNotification.vessel.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
            reportingRepository.findAll(
                ReportingFilter(
                    vesselInternalReferenceNumbers = listOf(vesselInternalReferenceNumber),
                    isArchived = false,
                    isDeleted = false,
                    types = listOf(ReportingType.INFRACTION_SUSPICION),
                ),
            )
        }

        val reportingsCount = currentReportings?.count() ?: 0

        return priorNotification.copy(reportingsCount = reportingsCount)
    }
}
