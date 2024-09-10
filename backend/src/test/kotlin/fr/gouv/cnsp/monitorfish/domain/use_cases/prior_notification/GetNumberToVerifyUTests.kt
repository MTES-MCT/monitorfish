package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetNumberToVerifyUTests {
    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @Test
    fun `execute Should return a map of PNO for each facade to verify`() {
        // Given
        given(portRepository.findAll()).willReturn(
            listOf(
                PortFaker.fakePort(locode = "AEFJR", name = "Al Jazeera Port", facade = "NAMO"),
                PortFaker.fakePort(locode = "AEFAT", name = "Al Jazeera Port", facade = "Guyane"),
                PortFaker.fakePort(locode = "AEJAZ", name = "Arzanah Island", facade = "SA"),
            ),
        )
        given(logbookReportRepository.findAllPriorNotificationsToVerify()).willReturn(
            listOf(
                PriorNotification(
                    reportId = "FAKE_REPORT_ID_1",
                    createdAt = null,
                    didNotFishAfterZeroNotice = false,
                    isManuallyCreated = false,
                    logbookMessageAndValue =
                        LogbookMessageAndValue(
                            clazz = PNO::class.java,
                            logbookMessage =
                                LogbookMessage(
                                    id = 1,
                                    reportId = "FAKE_REPORT_ID_1",
                                    referencedReportId = null,
                                    integrationDateTime = ZonedDateTime.now(),
                                    isCorrectedByNewerMessage = false,
                                    isDeleted = false,
                                    isEnriched = false,
                                    message = PNO().apply { port = "AEFJR" },
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
                    updatedAt = null,
                    vessel = null,
                    lastControlDateTime = null,
                ),
                PriorNotification(
                    reportId = "FAKE_REPORT_ID_2",
                    createdAt = null,
                    didNotFishAfterZeroNotice = false,
                    isManuallyCreated = false,
                    logbookMessageAndValue =
                        LogbookMessageAndValue(
                            clazz = PNO::class.java,
                            logbookMessage =
                                LogbookMessage(
                                    id = 1,
                                    reportId = "FAKE_REPORT_ID_2_COR",
                                    referencedReportId = "FAKE_NONEXISTENT_REPORT_ID_2",
                                    integrationDateTime = ZonedDateTime.now(),
                                    isCorrectedByNewerMessage = false,
                                    isDeleted = false,
                                    isEnriched = false,
                                    message = PNO().apply { port = "AEFAT" },
                                    operationDateTime = ZonedDateTime.now(),
                                    operationNumber = "1",
                                    operationType = LogbookOperationType.COR,
                                    reportDateTime = ZonedDateTime.now(),
                                    transmissionFormat = LogbookTransmissionFormat.ERS,
                                ),
                        ),
                    port = null,
                    reportingCount = null,
                    seafront = null,
                    sentAt = null,
                    updatedAt = null,
                    vessel = null,
                    lastControlDateTime = null,
                ),
            ),
        )

        // When
        val result =
            GetNumberToVerify(
                logbookReportRepository,
                manualPriorNotificationRepository,
                portRepository,
                riskFactorRepository,
            ).execute()

        // Then
        assertThat(result.perSeafrontGroupCount.values).hasSize(8)
        assertThat(result.perSeafrontGroupCount[SeafrontGroup.ALL]).isEqualTo(2)
        assertThat(result.perSeafrontGroupCount[SeafrontGroup.NAMO]).isEqualTo(1)
        assertThat(result.perSeafrontGroupCount[SeafrontGroup.OUTREMEROA]).isEqualTo(1)
        assertThat(result.perSeafrontGroupCount[SeafrontGroup.NONE]).isEqualTo(0)
    }
}
