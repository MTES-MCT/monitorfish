package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

data class PriorNotificationCheck(
    val reportId: String,
    val createdAt: String,
    /**
     * Is it a prior notification requiring a manual verification?
     *
     * It should stay `true` even after the manual verification is done (`isVerified == true`)
     * to differanciate mandatory-verification prior notifications from non-mandatory-verification prior notifications.
     *
     * # Example
     *
     * - `isInVerificationScope == true && isVerified == false` => The prior notification must be manually verified.
     * - `isInVerificationScope == true && isVerified == true` => The prior notification had to be manually verified, and it was.
     * - `isInVerificationScope == false && isVerified == true` => The prior notification did not have to be manually verified, but it was.
     * - `isInVerificationScope == true && isVerified == false` => /!\ SHOULD NEVER HAPPEN.
     */
    val isInVerificationScope: Boolean,
    val isVerified: Boolean,
    val isBeingSent: Boolean,
    val isSent: Boolean,
    val updatedAt: String,
) {
    companion object {
        fun new(
            reportId: String,
            isInVerificationScope: Boolean = false,
            isVerified: Boolean = false,
            isBeingSent: Boolean = false,
            isSent: Boolean = false,
        ): PriorNotificationCheck {
            return PriorNotificationCheck(
                reportId = reportId,
                createdAt = CustomZonedDateTime.now().toString(),
                isInVerificationScope = isInVerificationScope,
                isVerified = isVerified,
                isBeingSent = isBeingSent,
                isSent = isSent,
                updatedAt = CustomZonedDateTime.now().toString(),
            )
        }
    }
}
