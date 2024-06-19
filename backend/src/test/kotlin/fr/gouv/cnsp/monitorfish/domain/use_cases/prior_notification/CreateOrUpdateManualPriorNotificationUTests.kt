package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
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
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var computeFleetSegments: ComputeFleetSegments

    @MockBean
    private lateinit var computePnoTypes: ComputePnoTypes

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @Test
    fun `execute Should return a list of prior notifications with their total length`() {
        val fakeCreatedManualPriorNotificationReportId = "00000000-0000-4000-0000-000000000001"
        val fakeVessel = Vessel(
            id = 1,
            flagState = CountryCode.FR,
            hasLogbookEsacapt = false,
        )

        // Given
        given(vesselRepository.findVesselById(any())).willReturn(fakeVessel)
        given(computePnoTypes.execute(any(), any(), any())).willReturn(emptyList())
        given(manualPriorNotificationRepository.save(any())).willReturn(fakeCreatedManualPriorNotificationReportId)
        given(getPriorNotification.execute(fakeCreatedManualPriorNotificationReportId)).willReturn(
            PriorNotification(
                reportId = fakeCreatedManualPriorNotificationReportId,
                authorTrigram = null,
                createdAt = null,
                didNotFishAfterZeroNotice = false,
                isManuallyCreated = false,
                logbookMessageTyped = LogbookMessageTyped(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessage(
                        id = 1,
                        reportId = fakeCreatedManualPriorNotificationReportId,
                        referencedReportId = null,
                        analyzedByRules = emptyList(),
                        isDeleted = false,
                        integrationDateTime = ZonedDateTime.now(),
                        isCorrectedByNewerMessage = false,
                        isEnriched = true,
                        message = PNO(),
                        messageType = "PNO",
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "1",
                        operationType = LogbookOperationType.DAT,
                        reportDateTime = ZonedDateTime.now(),
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
                ),
                port = null,
                reportingCount = null,
                seafront = null,
                sentAt = null,
                state = null,
                updatedAt = null,
                vessel = null,
                vesselRiskFactor = null,
            ),
        )

        // When
        val result = CreateOrUpdateManualPriorNotification(
            gearRepository,
            manualPriorNotificationRepository,
            portRepository,
            vesselRepository,
            computeFleetSegments,
            computePnoTypes,
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
        assertThat(result.reportId).isEqualTo(fakeCreatedManualPriorNotificationReportId)
    }
}
