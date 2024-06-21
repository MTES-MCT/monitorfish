package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.VESSEL_FLAG_COUNTRY_CODES_WITHOUT_SYSTEMATIC_VERIFICATION
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD

data class ManualPriorNotificationComputedValues(
    val isInVerificationScope: Boolean,
    val isVesselUnderCharter: Boolean?,
    val tripSegments: List<FleetSegment>,
    val types: List<PnoType>,
    val vesselRiskFactor: Double?,
) {
    companion object {
        fun computeIsInVerificationScope(
            vesselFlagCountryCode: CountryCode?,
            vesselRiskFactor: Double?,
        ): Boolean {
            if (vesselFlagCountryCode == null || vesselRiskFactor == null) {
                return true
            }

            return vesselRiskFactor >= VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD ||
                (vesselFlagCountryCode !in VESSEL_FLAG_COUNTRY_CODES_WITHOUT_SYSTEMATIC_VERIFICATION)
        }
    }
}
