package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentReporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.springframework.cache.annotation.CachePut
import org.springframework.cache.annotation.Cacheable
import java.time.ZonedDateTime

/**
 * The active vessels data shared by all users (everything but their vessel groups).
 *
 * Computing it takes seconds with the production volumes, and every user polls the active vessels:
 * it is computed once for all users, and refreshed ahead by `RefreshActiveVesselsCache`.
 */
@UseCase
class GetActiveVesselsWithoutVesselGroups(
    private val lastPositionRepository: LastPositionRepository,
    private val reportingRepository: ReportingRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
) {
    @Cacheable(value = [ACTIVE_VESSELS_WITHOUT_VESSEL_GROUPS_CACHE], sync = true)
    fun execute(): List<EnrichedActiveVessel> = getActiveVessels()

    @CachePut(value = [ACTIVE_VESSELS_WITHOUT_VESSEL_GROUPS_CACHE])
    fun refresh(): List<EnrichedActiveVessel> = getActiveVessels()

    private fun getActiveVessels(): List<EnrichedActiveVessel> {
        val now = ZonedDateTime.now()
        val currentReportings = reportingRepository.findAllCurrent()
        val currentReportingsByCfr = currentReportings.groupBy { it.internalReferenceNumber }
        val currentReportingsByVesselIds = currentReportings.groupBy { it.vesselId }

        val cfrsWithReportings = currentReportings.mapNotNull { it.internalReferenceNumber }.distinct().sorted()
        val lastDepDatetimePerCfr = logbookReportRepository.findLastDepDatetimeOfCurrentTripsPerCfr(cfrsWithReportings)

        val lastPositionsWithProfileAndVessel =
            lastPositionRepository.findActiveVesselWithReferentialData(
                now.minusMonths(1),
            )

        val futurePriorNotificationsGroupByInternalReferenceNumber =
            (
                logbookReportRepository.findAllAcknowledgedPriorNotificationsForActiveVessels() +
                    manualPriorNotificationRepository.findAllForActiveVessels()
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

                activeVessel.copy(
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

    companion object {
        const val ACTIVE_VESSELS_WITHOUT_VESSEL_GROUPS_CACHE = "active_vessels_without_vessel_groups"
    }
}
