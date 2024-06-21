package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.fakers.VesselFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class CreateOrUpdateManualPriorNotificationUTests {
    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var computeManualPriorNotification: ComputeManualPriorNotification

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @Test
    fun `execute Should update a manual prior notification`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(vesselRepository.findVesselById(any())).willReturn(VesselFaker.fakeVessel())
        given(computeManualPriorNotification.execute(any(), any(), any(), any(), any())).willReturn(
            ManualPriorNotificationComputedValues(
                isInVerificationScope = false,
                isVesselUnderCharter = null,
                tripSegments = emptyList(),
                types = emptyList(),
                vesselRiskFactor = null,
            ),
        )
        given(manualPriorNotificationRepository.save(any())).willReturn(fakePriorNotification.reportId!!)
        given(getPriorNotification.execute(fakePriorNotification.reportId!!)).willReturn(fakePriorNotification)

        // When
        val result = CreateOrUpdateManualPriorNotification(
            gearRepository,
            manualPriorNotificationRepository,
            portRepository,
            vesselRepository,
            computeManualPriorNotification,
            getPriorNotification,
        ).execute(
            authorTrigram = "ABC",
            didNotFishAfterZeroNotice = false,
            expectedArrivalDate = "2024-01-01T00:00:00Z",
            expectedLandingDate = "2024-01-01T00:00:00Z",
            faoArea = "FAKE_FAO_AREA",
            fishingCatches = emptyList(),
            note = null,
            portLocode = "FAKE_PORT_LOCODE",
            reportId = null,
            sentAt = "2024-01-01T00:00:00Z",
            tripGearCodes = emptyList(),
            vesselId = 1,
        )

        // Then
        assertThat(result.reportId).isEqualTo(fakePriorNotification.reportId)
    }
}
