package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment

val VESSEL_FLAG_COUNTRY_CODES_WITHOUT_SYSTEMATIC_VERIFICATION: List<CountryCode> = listOf(CountryCode.FR)
const val VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD: Double = 2.3

/**
 * Real-time computed values displayed within a manual prior notification form.
 */
data class ManualPriorNotificationComputedValues(
    val isVesselUnderCharter: Boolean?,
    /** Next initial state of the manual prior notification once it will be created or updated. */
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
