package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.fakers.LogbookMessageFaker
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
