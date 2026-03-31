package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentReporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetActiveVessels(
    private val lastPositionRepository: LastPositionRepository,
    private val reportingRepository: ReportingRepository,
    private val vesselGroupRepository: VesselGroupRepository,
    private val getAuthorizedUser: GetAuthorizedUser,
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetActiveVessels::class.java)

    fun execute(userEmail: String): List<EnrichedActiveVessel> {
        val now = ZonedDateTime.now()
        val userService = getAuthorizedUser.execute(userEmail).service
        val currentReportings = reportingRepository.findAllCurrent()
        val currentReportingsByCfr = currentReportings.groupBy { it.internalReferenceNumber }
        val currentReportingsByVesselIds = currentReportings.groupBy { it.vesselId }

        val cfrsWithReportings = currentReportings.mapNotNull { it.internalReferenceNumber }.distinct()
        val lastDepDatetimePerCfr = logbookReportRepository.findLastDepDatetimeOfCurrentTripsPerCfr(cfrsWithReportings)

        val lastPositionsWithProfileAndVessel =
            lastPositionRepository.findActiveVesselWithReferentialData(
                now.minusMonths(1),
            )
        val vesselGroups =
            vesselGroupRepository.findAllByUserAndSharing(
                user = userEmail,
                service = userService,
            )

        val priorNotificationsFilter =
            PriorNotificationsFilter(
                willArriveAfter = now,
                willArriveBefore = now.plusDays(2),
            )
        val futurePriorNotificationsGroupByInternalReferenceNumber =
            (
                logbookReportRepository
                    .findAllAcknowledgedPriorNotifications(priorNotificationsFilter) +
                    manualPriorNotificationRepository.findAll(
                        priorNotificationsFilter,
                    )
            ).groupBy { it.vessel?.internalReferenceNumber }

        return lastPositionsWithProfileAndVessel
            .map { activeVessel ->
                val internalReferenceNumber =
                    activeVessel.vesselProfile?.cfr ?: activeVessel.lastPosition?.internalReferenceNumber
                val vesselId = activeVessel.lastPosition?.vesselId

                val foundReportings =
                    getMatchedReportings(
                        vesselId = vesselId,
                        currentReportingsByVesselIds = currentReportingsByVesselIds,
                        internalReferenceNumber = internalReferenceNumber,
                        currentReportingsByCfr = currentReportingsByCfr,
                    )
                val foundReportingTypes = foundReportings.map { it.type }

                val lastDep = internalReferenceNumber?.let { lastDepDatetimePerCfr[it] }
                val hasCurrentTripInfractionSuspicion =
                    lastDep != null &&
                        foundReportings.any {
                            it.type == ReportingType.INFRACTION_SUSPICION && it.creationDate.isAfter(lastDep)
                        }

                val landingPort =
                    internalReferenceNumber?.let {
                        futurePriorNotificationsGroupByInternalReferenceNumber[it]?.firstOrNull()?.port
                    }

                val foundVesselGroups =
                    vesselGroups.filter { vesselGroup ->
                        when (vesselGroup) {
                            is DynamicVesselGroup -> vesselGroup.containsActiveVessel(activeVessel, now)
                            is FixedVesselGroup -> vesselGroup.containsActiveVessel(activeVessel)
                        }
                    }

                EnrichedActiveVessel(
                    lastPosition = activeVessel.lastPosition,
                    vesselProfile = activeVessel.vesselProfile,
                    vessel = activeVessel.vessel,
                    producerOrganization = activeVessel.producerOrganization,
                    vesselGroups = foundVesselGroups,
                    riskFactor = activeVessel.riskFactor,
                    beacon = activeVessel.beacon,
                    landingPort = landingPort,
                    reportingTypes = foundReportingTypes,
                    hasCurrentTripInfractionSuspicion = hasCurrentTripInfractionSuspicion,
                )
            }
    }

    /**
     * Keys used for each entity to select reportings :
     * - VesselProfile: `cfr`
     * - LastPosition: `vesselId` and `cfr`
     */
    private fun getMatchedReportings(
        vesselId: Int?,
        currentReportingsByVesselIds: Map<Int?, List<CurrentReporting>>,
        internalReferenceNumber: String?,
        currentReportingsByCfr: Map<String?, List<CurrentReporting>>,
    ): List<CurrentReporting> {
        val reportingsWithVesselIdIdentifier =
            vesselId?.let {
                currentReportingsByVesselIds.get(it)
            } ?: emptyList()

        val reportingsWithCfrIdentifier =
            internalReferenceNumber?.let {
                currentReportingsByCfr.get(it)
            } ?: emptyList()

        return (reportingsWithVesselIdIdentifier + reportingsWithCfrIdentifier).distinctBy { it.id }
    }
}
