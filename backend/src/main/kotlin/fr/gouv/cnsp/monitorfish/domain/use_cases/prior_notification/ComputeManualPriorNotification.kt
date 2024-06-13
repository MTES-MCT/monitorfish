package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments

@UseCase
class ComputeManualPriorNotification(
    private val vesselRepository: VesselRepository,

    private val computeFleetSegments: ComputeFleetSegments,
    private val computePnoTypes: ComputePnoTypes,
    private val computeRiskFactor: ComputeRiskFactor,
) {
    fun execute(
        faoArea: String,
        fishingCatches: List<LogbookFishingCatch>,
        portLocode: String,
        tripGearCodes: List<String>,
        vesselId: Int,
    ): Triple<List<FleetSegment>, List<PnoType>, Double> {
        val vessel = vesselRepository.findVesselById(vesselId)

        val faoAreas = listOf(faoArea)
        val fishingCatchesWithFaoArea = fishingCatches.map { it.copy(faoZone = faoArea) }
        val specyCodes = fishingCatches.mapNotNull { it.species }
        val vesselCfr = vessel.internalReferenceNumber
            ?: throw BackendUsageException(
                BackendUsageErrorCode.MISSING_PROPS_ON_RELATED_RESOURCE,
                "Vessel with id $vesselId has no `internalReferenceNumber`.",
            )

        val fleetSegments = computeFleetSegments.execute(faoAreas, tripGearCodes, specyCodes)
        val priorNotificationTypes = computePnoTypes.execute(fishingCatchesWithFaoArea, tripGearCodes, vessel.flagState)
        val riskFactor = computeRiskFactor.execute(portLocode, fleetSegments, vesselCfr)

        return Triple(fleetSegments, priorNotificationTypes, riskFactor)
    }
}
