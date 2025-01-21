package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.fakers.VesselFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class CreateOrUpdateManualPriorNotificationUTests {
    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockBean
    private lateinit var pnoPortSubscriptionRepository: PnoPortSubscriptionRepository

    @MockBean
    private lateinit var pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository

    @MockBean
    private lateinit var pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var computeManualPriorNotification: ComputeManualPriorNotification

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @Test
    fun `execute Should create a manual prior notification`() {
        val newFakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(vesselRepository.findVesselById(any())).willReturn(VesselFaker.fakeVessel())
        given(computeManualPriorNotification.execute(any(), any(), any(), any(), any(), any())).willReturn(
            ManualPriorNotificationComputedValues(
                isVesselUnderCharter = null,
                nextState = PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                tripSegments = emptyList(),
                types = emptyList(),
                vesselRiskFactor = null,
            ),
        )
        given(manualPriorNotificationRepository.save(any())).willReturn(newFakePriorNotification)
        given(
            getPriorNotification.execute(
                newFakePriorNotification.reportId!!,
                newFakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                true,
            ),
        ).willReturn(newFakePriorNotification)

        // When
        val result =
            CreateOrUpdateManualPriorNotification(
                gearRepository,
                manualPriorNotificationRepository,
                pnoFleetSegmentSubscriptionRepository,
                pnoPortSubscriptionRepository,
                pnoVesselSubscriptionRepository,
                portRepository,
                priorNotificationPdfDocumentRepository,
                vesselRepository,
                computeManualPriorNotification,
                getPriorNotification,
            ).execute(
                author = "creator@example.org",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                expectedLandingDate = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                fishingCatches = emptyList(),
                globalFaoArea = "FAKE_FAO_AREA",
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                note = null,
                portLocode = "FAKE_PORT_LOCODE",
                purpose = LogbookMessagePurpose.LAN,
                reportId = null,
                sentAt = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                tripGearCodes = emptyList(),
                vesselId = 1,
            )

        // Then
        assertThat(result.reportId!!).isEqualTo(newFakePriorNotification.reportId!!)
    }

    @Test
    fun `execute Should update a manual prior notification`() {
        val existingFakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        val updatedFakePriorNotification = existingFakePriorNotification.copy(updatedAt = ZonedDateTime.now())

        // Given
        given(manualPriorNotificationRepository.findByReportId(existingFakePriorNotification.reportId!!)).willReturn(
            existingFakePriorNotification,
        )
        given(vesselRepository.findVesselById(any())).willReturn(VesselFaker.fakeVessel())
        given(computeManualPriorNotification.execute(any(), any(), any(), any(), any(), any())).willReturn(
            ManualPriorNotificationComputedValues(
                isVesselUnderCharter = null,
                nextState = PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                tripSegments = emptyList(),
                types = emptyList(),
                vesselRiskFactor = null,
            ),
        )
        given(manualPriorNotificationRepository.save(any())).willReturn(updatedFakePriorNotification)
        given(
            getPriorNotification.execute(
                existingFakePriorNotification.reportId!!,
                existingFakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                true,
            ),
        ).willReturn(updatedFakePriorNotification)

        // When
        val result =
            CreateOrUpdateManualPriorNotification(
                gearRepository,
                manualPriorNotificationRepository,
                pnoFleetSegmentSubscriptionRepository,
                pnoPortSubscriptionRepository,
                pnoVesselSubscriptionRepository,
                portRepository,
                priorNotificationPdfDocumentRepository,
                vesselRepository,
                computeManualPriorNotification,
                getPriorNotification,
            ).execute(
                author = "editor@example.org",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                expectedLandingDate = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                fishingCatches = emptyList(),
                globalFaoArea = "FAKE_FAO_AREA",
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                note = null,
                portLocode = "FAKE_PORT_LOCODE",
                purpose = LogbookMessagePurpose.LAN,
                reportId = existingFakePriorNotification.reportId!!,
                sentAt = ZonedDateTime.parse("2024-01-01T00:00:00Z"),
                tripGearCodes = emptyList(),
                vesselId = 1,
            )

        // Then
        assertThat(result.reportId!!).isEqualTo(existingFakePriorNotification.reportId!!)
    }
}
