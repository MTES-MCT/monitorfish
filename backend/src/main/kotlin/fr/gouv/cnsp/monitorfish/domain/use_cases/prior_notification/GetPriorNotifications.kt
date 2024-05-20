package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.sorters.LogbookReportSortColumn
import org.springframework.data.domain.Sort

@UseCase
class GetPriorNotifications(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        filter: LogbookReportFilter,
        sortColumn: LogbookReportSortColumn,
        sortDirection: Sort.Direction,
        pageSize: Int,
        pageNumber: Int,
    ): Pair<List<PriorNotification>, Int> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val incompletePriorNotifications = logbookReportRepository.findAllPriorNotifications(filter)
        val priorNotificationsWithoutReportingsCount = incompletePriorNotifications
            .map { priorNotification ->
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
                    seafront = port?.facade,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )

                finalPriorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                finalPriorNotification
            }
        val priorNotifications = enrichPriorNotificationsWithReportingCount(priorNotificationsWithoutReportingsCount)

        val ascendingSortedPriorNotifications = priorNotifications.sortedWith(
            compareBy { priorNotification ->
                val segmentCodes = priorNotification.logbookMessageTyped.logbookMessage
                    .tripSegments?.joinToString(", ") { it.code }
                val priorNotificationTypeNames = priorNotification.logbookMessageTyped.typedMessage
                    .pnoTypes.map { it.name }.joinToString(", ")

                when (sortColumn) {
                    LogbookReportSortColumn.EXPECTED_ARRIVAL_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc
                    LogbookReportSortColumn.EXPECTED_LANDING_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc
                    LogbookReportSortColumn.PORT_NAME -> priorNotification.port?.name
                    LogbookReportSortColumn.PRIOR_NOTIFICATION_TYPES -> priorNotificationTypeNames
                    LogbookReportSortColumn.TRIP_SEGMENT_CODES -> segmentCodes
                    LogbookReportSortColumn.VESSEL_NAME -> priorNotification.logbookMessageTyped.logbookMessage.vesselName
                    LogbookReportSortColumn.VESSEL_RISK_FACTOR -> priorNotification.vesselRiskFactor?.riskFactor
                }
            },
        )
        val sortedPriorNotifications = if (sortDirection == Sort.Direction.ASC) {
            ascendingSortedPriorNotifications
        } else {
            ascendingSortedPriorNotifications.reversed()
        }
        val sortedPriorNotificationsWithoutDeletedOnes = sortedPriorNotifications
            .filter { !it.logbookMessageTyped.logbookMessage.isDeleted }

        return Pair(
            sortedPriorNotificationsWithoutDeletedOnes
                .drop(pageNumber * pageSize)
                .take(pageSize),
            sortedPriorNotificationsWithoutDeletedOnes.size,
        )
    }

    private fun enrichPriorNotificationsWithReportingCount(
        priorNotifications: List<PriorNotification>,
    ): List<PriorNotification> {
        val currentReportings = reportingRepository.findAll(
            ReportingFilter(
                vesselInternalReferenceNumbers = priorNotifications.mapNotNull { it.vessel.internalReferenceNumber },
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.INFRACTION_SUSPICION),
            ),
        )

        val priorNotificationsWithReportingCount = priorNotifications.map { priorNotification ->
            val reportingsCount = currentReportings.count { reporting ->
                reporting.internalReferenceNumber == priorNotification.vessel.internalReferenceNumber
            }

            priorNotification.copy(reportingsCount = reportingsCount)
        }

        return priorNotificationsWithReportingCount
    }
}
