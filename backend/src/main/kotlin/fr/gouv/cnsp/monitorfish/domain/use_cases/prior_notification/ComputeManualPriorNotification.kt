package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments

val VESSEL_FLAG_COUNTRY_CODES_WITHOUT_SYSTEMATIC_VERIFICATION: List<CountryCode> = listOf(CountryCode.FR)
const val VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD: Double = 2.3

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
            .computeIsInVerificationScope(vesselFlagCountryCode, vesselRiskFactor)
        // TODO Implement DB check.
        val isPartOfControlUnitSubscriptions = true
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
