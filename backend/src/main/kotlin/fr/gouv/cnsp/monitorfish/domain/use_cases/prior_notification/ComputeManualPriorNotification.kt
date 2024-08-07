package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoSegmentSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments

@UseCase
class ComputeManualPriorNotification(
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
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
    ): ManualPriorNotificationComputedValues {
        val vessel = vesselRepository.findVesselById(vesselId)

        val faoAreas = listOf(faoArea)
        val fishingCatchesWithFaoArea = fishingCatches.map { it.copy(faoZone = faoArea) }
        val specyCodes = fishingCatches.mapNotNull { it.species }
        val vesselCfr = vessel?.internalReferenceNumber
        val vesselFlagCountryCode = vessel?.flagState

        val tripSegments = computeFleetSegments.execute(faoAreas, tripGearCodes, specyCodes)
        val types = computePnoTypes.execute(fishingCatchesWithFaoArea, tripGearCodes, vesselFlagCountryCode)
        val vesselRiskFactor = computeRiskFactor.execute(portLocode, tripSegments, vesselCfr)

        val isInVerificationScope = ManualPriorNotificationComputedValues
            .isInVerificationScope(vesselFlagCountryCode, vesselRiskFactor)
        val isPartOfControlUnitSubscriptions = pnoPortSubscriptionRepository.has(portLocode) ||
            pnoVesselSubscriptionRepository.has(vesselId) ||
            pnoSegmentSubscriptionRepository.has(portLocode, tripSegments.map { it.segment })
        val nextState = PriorNotification.getNextState(isInVerificationScope, isPartOfControlUnitSubscriptions)

        return ManualPriorNotificationComputedValues(
            isVesselUnderCharter = vessel?.underCharter,
            nextState,
            tripSegments,
            types,
            vesselRiskFactor,
        )
    }
}
