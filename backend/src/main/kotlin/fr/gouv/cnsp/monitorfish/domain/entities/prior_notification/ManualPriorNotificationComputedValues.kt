package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.VESSEL_FLAG_COUNTRY_CODES_WITHOUT_SYSTEMATIC_VERIFICATION
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD

/**
 * Real-time computed values displayed within a prior notification form.
 */
data class ManualPriorNotificationComputedValues(
    val isVesselUnderCharter: Boolean?,
    /** Next initial state of the prior notification once it will be created or updated. */
    val nextState: PriorNotificationState,
    val tripSegments: List<FleetSegment>,
    val types: List<PnoType>,
    val vesselRiskFactor: Double?,
) {
    companion object {
        fun isInVerificationScope(
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
