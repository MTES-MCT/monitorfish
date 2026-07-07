package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ControlledVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselProfileRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import java.time.ZonedDateTime

@UseCase
class GetControlledVesselById(
    private val vesselRepository: VesselRepository,
    private val reportingRepository: ReportingRepository,
    private val getAllUserVesselGroups: GetAllUserVesselGroups,
    private val logbookReportRepository: LogbookReportRepository,
    private val beaconRepository: BeaconRepository,
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
    private val vesselProfileRepository: VesselProfileRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val riskFactorRepository: RiskFactorRepository,
) {
    suspend fun execute(
        vesselId: Int,
        userEmail: String,
    ): ControlledVessel =
        coroutineScope {
            val now = ZonedDateTime.now()
            val vessel =
                vesselRepository.findVesselById(vesselId)
                    ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

            val userVesselGroups = async { getAllUserVesselGroups.execute(userEmail) }
            val enrichedActiveVessel = enrichVessel(vessel, vesselId)

            ControlledVessel(
                controlledVessel = vessel,
                groups = findSharedGroups(userVesselGroups.await(), enrichedActiveVessel, now),
                tripReportings = findCurrentTripReportings(vessel, vesselId),
            )
        }

    private suspend fun enrichVessel(
        vessel: Vessel,
        vesselId: Int,
    ): EnrichedActiveVessel =
        coroutineScope {
            val beacon = async { beaconRepository.findBeaconByVesselId(vesselId) }
            val producerOrganization =
                async {
                    vessel.internalReferenceNumber?.let {
                        producerOrganizationMembershipRepository.findByInternalReferenceNumber(it)
                    }
                }
            val vesselProfile =
                async {
                    vessel.internalReferenceNumber?.let { vesselProfileRepository.findByCfr(it) }
                }
            val riskFactor = async { riskFactorRepository.findByVesselId(vesselId) }
            val lastPosition = lastPositionRepository.findByVesselId(vesselId)

            EnrichedActiveVessel(
                lastPosition = lastPosition,
                beacon = beacon.await(),
                vesselProfile = vesselProfile.await(),
                vessel = vessel,
                producerOrganization = producerOrganization.await(),
                riskFactor = riskFactor.await() ?: VesselRiskFactor(),
                landingPort = null,
            )
        }

    private fun findSharedGroups(
        userVesselGroups: List<VesselGroupBase>,
        enrichedActiveVessel: EnrichedActiveVessel,
        now: ZonedDateTime,
    ): List<VesselGroupBase> =
        userVesselGroups
            .filter { it.sharing == Sharing.SHARED }
            .filter { it.containsActiveVessel(enrichedActiveVessel, now) }

    private fun VesselGroupBase.containsActiveVessel(
        enrichedActiveVessel: EnrichedActiveVessel,
        now: ZonedDateTime,
    ): Boolean =
        when (this) {
            is DynamicVesselGroup -> containsActiveVessel(enrichedActiveVessel, now)
            is FixedVesselGroup -> containsActiveVessel(enrichedActiveVessel)
            is PriorityVesselGroup -> containsActiveVessel(enrichedActiveVessel)
        }

    private fun findCurrentTripReportings(
        vessel: Vessel,
        vesselId: Int,
    ): List<Reporting> {
        val currentTripDeparture = findCurrentTripDeparture(vessel) ?: return listOf()

        return reportingRepository
            .findAll(
                ReportingFilter(
                    isDeleted = false,
                    isArchived = false,
                    vesselIds = listOf(vesselId),
                    types = listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT),
                ),
            ).filter { it.isOpenedDuringCurrentTrip(currentTripDeparture) }
    }

    private fun findCurrentTripDeparture(vessel: Vessel): ZonedDateTime? {
        val cfr = vessel.internalReferenceNumber ?: return null

        return logbookReportRepository.findLastDepDatetimeOfCurrentTripsPerCfr(listOf(cfr))[cfr]
    }

    private fun Reporting.isOpenedDuringCurrentTrip(currentTripDeparture: ZonedDateTime): Boolean =
        when (type) {
            ReportingType.INFRACTION_SUSPICION -> creationDate.isAfter(currentTripDeparture)
            ReportingType.ALERT -> validationDate?.isAfter(currentTripDeparture) ?: false
            else -> false
        }
}
