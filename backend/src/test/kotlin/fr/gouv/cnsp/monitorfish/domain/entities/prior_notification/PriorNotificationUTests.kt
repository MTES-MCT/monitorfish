package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.fakers.LogbookMessageFaker
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class PriorNotificationUTests {
    @Test
    fun `isPriorNotificationZero Should return true when all catches to land have a null weight`() {
        // Given
        val priorNotification = getFakePriorNotificationWithCatchWeights(null, null, null)

        // When
        val result = priorNotification.isPriorNotificationZero

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isPriorNotificationZero Should return true when all catches to land have a weight equal to 0`() {
        // Given
        val priorNotification = getFakePriorNotificationWithCatchWeights(0.0, 0.0, 0.0)

        // When
        val result = priorNotification.isPriorNotificationZero

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isPriorNotificationZero Should return false when there is no catch to land`() {
        // Given
        val priorNotification =
            PriorNotificationFaker.fakePriorNotification().copy(
                logbookMessageAndValue =
                    LogbookMessageAndValue(
                        clazz = PNO::class.java,
                        logbookMessage =
                            LogbookMessageFaker.fakePnoLogbookMessage().copy(
                                message =
                                    LogbookMessageFaker.fakePnoMessage().apply {
                                        catchToLand = emptyList()
                                    },
                            ),
                    ),
            )

        // When
        val result = priorNotification.isPriorNotificationZero

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `isPriorNotificationZero Should return false when any catch to land has a weight greater than 0`() {
        // Given
        val priorNotification = getFakePriorNotificationWithCatchWeights(null, 0.0, 4.2)

        // When
        val result = priorNotification.isPriorNotificationZero

        // Then
        assertThat(result).isFalse()
    }

    // ---------------------------------------------------------------------------
    // getVerificationReasons
    // ---------------------------------------------------------------------------

    @Test
    fun `getVerificationReasons Should return only MISSING_DATA When vesselFlagCountryCode is null`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = null,
                vesselFlagCountryCode = null,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).containsExactly(PnoVerificationReason.MISSING_DATA)
    }

    @Test
    fun `getVerificationReasons Should return only MISSING_DATA When vesselRiskFactor is null`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = null,
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = null,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).containsExactly(PnoVerificationReason.MISSING_DATA)
    }

    @Test
    fun `getVerificationReasons Should return OPEN_REPORTING When vessel has active infraction suspicions`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = null,
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 2,
            )

        assertThat(result).containsExactly(PnoVerificationReason.OPEN_REPORTING)
    }

    @Test
    fun `getVerificationReasons Should return HIGH_RISK_FACTOR When vessel risk factor meets threshold`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = null,
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = PriorNotification.VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).containsExactly(PnoVerificationReason.HIGH_RISK_FACTOR)
    }

    @Test
    fun `getVerificationReasons Should return FOREIGN_FLAG_COUNTRY When vessel is not French`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = null,
                vesselFlagCountryCode = CountryCode.GB,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).containsExactly(PnoVerificationReason.FOREIGN_FLAG_COUNTRY)
    }

    @Test
    fun `getVerificationReasons Should return FOREIGN_PORT When logbook PNO targets a port in a monitored country`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = PortFaker.fakePort(countryCode = "GB"),
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).containsExactly(PnoVerificationReason.FOREIGN_PORT)
    }

    @Test
    fun `getVerificationReasons Should return all applicable reasons When several conditions are met`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = PortFaker.fakePort(countryCode = "GB"),
                vesselFlagCountryCode = CountryCode.GB,
                vesselRiskFactor = PriorNotification.VESSEL_RISK_FACTOR_VERIFICATION_THRESHOLD,
                infractionSuspicionsCount = 2,
            )

        assertThat(result).containsExactly(
            PnoVerificationReason.HIGH_RISK_FACTOR,
            PnoVerificationReason.OPEN_REPORTING,
            PnoVerificationReason.FOREIGN_FLAG_COUNTRY,
            PnoVerificationReason.FOREIGN_PORT,
        )
    }

    @Test
    fun `getVerificationReasons Should be empty When manual PNO targets a port in a monitored country`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = true,
                port = PortFaker.fakePort(countryCode = "GB"),
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).isEmpty()
    }

    @Test
    fun `getVerificationReasons Should be empty When no condition is met`() {
        val result =
            PriorNotification.getVerificationReasons(
                isManual = false,
                port = PortFaker.fakePort(countryCode = "FR"),
                vesselFlagCountryCode = CountryCode.FR,
                vesselRiskFactor = 1.0,
                infractionSuspicionsCount = 0,
            )

        assertThat(result).isEmpty()
    }

    companion object {
        fun getFakePriorNotificationWithCatchWeights(
            firstCatchWeight: Double?,
            secondCatchWeight: Double?,
            thirdCatchWeight: Double?,
        ) = PriorNotificationFaker.fakePriorNotification().copy(
            logbookMessageAndValue =
                LogbookMessageAndValue(
                    clazz = PNO::class.java,
                    logbookMessage =
                        LogbookMessageFaker.fakePnoLogbookMessage().copy(
                            message =
                                LogbookMessageFaker.fakePnoMessage().apply {
                                    catchToLand =
                                        listOf(
                                            LogbookFishingCatch(weight = firstCatchWeight),
                                            LogbookFishingCatch(weight = secondCatchWeight),
                                            LogbookFishingCatch(weight = thirdCatchWeight),
                                        )
                                },
                        ),
                ),
        )
    }
}
