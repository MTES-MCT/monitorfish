package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class InvalidateOutdatedBFTSWOZeroPNOsUTests {
    @MockitoBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @Test
    fun `execute Should invalidate outdated bft swo zero pnos`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(manualPriorNotificationRepository.findAll(any()))
            .willReturn(listOf(fakePriorNotification))

        // When
        InvalidateOutdatedBFTSWOZeroPNOs(manualPriorNotificationRepository).execute()

        // Then
        verify(manualPriorNotificationRepository).invalidate(
            eq(fakePriorNotification.reportId!!),
        )
    }
}
