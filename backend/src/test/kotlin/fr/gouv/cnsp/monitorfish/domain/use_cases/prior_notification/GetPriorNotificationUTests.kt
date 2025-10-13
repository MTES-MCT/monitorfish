package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationUTests {
    @MockitoBean
    private lateinit var gearRepository: GearRepository

    @MockitoBean
    private lateinit var logbookRawMessageRepository: LogbookRawMessageRepository

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var portRepository: PortRepository

    @MockitoBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockitoBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute Should return a prior notification with a non-corrected logbook report operation`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(
            logbookReportRepository.findAcknowledgedPriorNotificationByReportId(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
            ),
        ).willReturn(fakePriorNotification)

        // When
        val result =
            GetPriorNotification(
                gearRepository,
                logbookRawMessageRepository,
                logbookReportRepository,
                manualPriorNotificationRepository,
                portRepository,
                reportingRepository,
                riskFactorRepository,
                speciesRepository,
                vesselRepository,
            ).execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            )

        // Then
        assertThat(result.logbookMessageAndValue.logbookMessage.reportId)
            .isEqualTo(fakePriorNotification.reportId!!)
        assertThat(result.logbookMessageAndValue.logbookMessage.referencedReportId).isNull()
    }

    @Test
    fun `execute Should return a prior notification with a corrected logbook report operation`() {
        val fakeLogbookMessageReferenceReportId = "FAKE_REPORT_ID_1"
        val fakePriorNotification =
            PriorNotificationFaker.fakePriorNotification().copy(
                reportId = null,
                logbookMessageAndValue =
                    LogbookMessageAndValue(
                        clazz = PNO::class.java,
                        logbookMessage =
                            LogbookMessage(
                                id = 2,
                                reportId = null,
                                referencedReportId = fakeLogbookMessageReferenceReportId,
                                isDeleted = false,
                                integrationDateTime = ZonedDateTime.now(),
                                isCorrectedByNewerMessage = true,
                                isEnriched = true,
                                message = PNO(),
                                messageType = "PNO",
                                operationDateTime = ZonedDateTime.now(),
                                operationNumber = "2",
                                operationType = LogbookOperationType.COR,
                                reportDateTime = ZonedDateTime.now(),
                                transmissionFormat = LogbookTransmissionFormat.ERS,
                            ),
                    ),
            )

        // Given
        given(
            logbookReportRepository.findAcknowledgedPriorNotificationByReportId(
                fakeLogbookMessageReferenceReportId,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
            ),
        ).willReturn(fakePriorNotification)

        // When
        val result =
            GetPriorNotification(
                gearRepository,
                logbookRawMessageRepository,
                logbookReportRepository,
                manualPriorNotificationRepository,
                portRepository,
                reportingRepository,
                riskFactorRepository,
                speciesRepository,
                vesselRepository,
            ).execute(
                fakeLogbookMessageReferenceReportId,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            )

        // Then
        assertThat(result.reportId).isNull()
        assertThat(result.logbookMessageAndValue.logbookMessage.reportId).isNull()
        assertThat(result.logbookMessageAndValue.logbookMessage.referencedReportId)
            .isEqualTo(fakeLogbookMessageReferenceReportId)
    }
}
