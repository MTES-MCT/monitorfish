package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.getSpeciesCatchesForSegmentCalculation

@UseCase
class ComputeManualPriorNotification(
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val vesselRepository: VesselRepository,
    private val speciesRepository: SpeciesRepository,
    private val computeFleetSegments: ComputeFleetSegments,
    private val computePnoTypes: ComputePnoTypes,
    private val computeRiskFactor: ComputeRiskFactor,
) {
    fun execute(
        fishingCatches: List<LogbookFishingCatch>,
        /** When there is a single FAO area shared by all fishing catches. */
        globalFaoArea: String?,
        portLocode: String,
        tripGearCodes: List<String>,
        vesselId: Int,
        year: Int,
    ): ManualPriorNotificationComputedValues {
        val vessel = vesselRepository.findVesselById(vesselId)
        requireNotNull(vessel) {
            "The vessel $vesselId is not found."
        }

        val species = speciesRepository.findAll()

        val fishingCatchesWithFaoArea =
            globalFaoArea?.let { fishingCatches.map { it.copy(faoZone = globalFaoArea) } }
                ?: fishingCatches
        val vesselCfr = vessel.internalReferenceNumber
        val vesselFlagCountryCode = vessel.flagState

        val speciesCatch = getSpeciesCatchesForSegmentCalculation(tripGearCodes, fishingCatchesWithFaoArea, species)
        val tripSegments = computeFleetSegments.execute(year, vessel.id, speciesCatch)
        val types = computePnoTypes.execute(fishingCatchesWithFaoArea, tripGearCodes, vesselFlagCountryCode)
        val vesselRiskFactor = computeRiskFactor.execute(portLocode, tripSegments, vesselCfr)

        val isInVerificationScope =
            ManualPriorNotificationComputedValues
                .isInVerificationScope(vesselFlagCountryCode, vesselRiskFactor)
        val isPartOfControlUnitSubscriptions =
            pnoPortSubscriptionRepository.has(portLocode) ||
                pnoVesselSubscriptionRepository.has(vesselId) ||
                pnoFleetSegmentSubscriptionRepository.has(portLocode, tripSegments.map { it.segment })
        val nextState = PriorNotification.getNextState(isInVerificationScope, isPartOfControlUnitSubscriptions)

        return ManualPriorNotificationComputedValues(
            isVesselUnderCharter = vessel.underCharter,
            nextState = nextState,
            tripSegments = tripSegments,
            types = types,
            vesselRiskFactor = vesselRiskFactor,
        )
    }
}
