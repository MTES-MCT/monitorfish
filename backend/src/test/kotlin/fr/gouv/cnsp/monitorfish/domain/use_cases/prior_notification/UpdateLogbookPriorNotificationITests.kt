package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationPdfDocumentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import java.util.stream.Stream

@ExtendWith(SpringExtension::class)
@Import(MapperConfiguration::class)
@SpringBootTest
class UpdateLogbookPriorNotificationITests : AbstractDBTests() {
    @Autowired
    private lateinit var updateLogbookPriorNotification: UpdateLogbookPriorNotification

    @Autowired
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Autowired
    private lateinit var priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository

    @Autowired
    private lateinit var getPriorNotification: GetPriorNotification

    data class TestCase(
        val reportId: String,
        val beforeStateRepresentation: String,
        val beforeState: PriorNotificationState,
        val expectedAfterStateRepresentation: String,
        val expectedAfterState: PriorNotificationState,
    )

    companion object {
        @JvmStatic
        fun getTestCases(): Stream<TestCase> {
            // Even if the forms are frozen when a prior notification is in pending (auto) send,
            // we still need to test these case here. The user may indeed be able to call this action
            // if its prior notification data is outdated.
            return Stream.of(
                TestCase(
                    "FAKE_OPERATION_101",
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_102",
                    "00001",
                    PriorNotificationState.PENDING_AUTO_SEND,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_103",
                    "00010",
                    PriorNotificationState.AUTO_SEND_DONE,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_104",
                    "00100",
                    PriorNotificationState.FAILED_SEND,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_105",
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_106",
                    "00110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                TestCase(
                    "FAKE_OPERATION_107",
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                TestCase(
                    "FAKE_OPERATION_108",
                    "01100",
                    PriorNotificationState.FAILED_SEND,
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                TestCase(
                    "FAKE_OPERATION_109_COR",
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                TestCase(
                    "FAKE_OPERATION_110",
                    "01110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getTestCases")
    @Transactional
    fun `Should transition logbook prior notification states as expected`(testCase: TestCase) {
        // Given
        val reportId = testCase.reportId
        val operationDate = CustomZonedDateTime.now().toZonedDateTime()

        // When
        val afterPriorNotification = updateLogbookPriorNotification.execute(reportId, operationDate, "ABC", "Une note.")

        // Then
        val afterPnoValue = afterPriorNotification.logbookMessageAndValue.value
        assertThat(afterPriorNotification.reportId).isEqualTo(testCase.reportId)
        assertThat(afterPriorNotification.isManuallyCreated)
            .isEqualTo(testCase.expectedAfterStateRepresentation[0] == '1')
        assertThat(afterPnoValue.isInVerificationScope).isEqualTo(testCase.expectedAfterStateRepresentation[1] == '1')
        assertThat(afterPnoValue.isVerified).isEqualTo(testCase.expectedAfterStateRepresentation[2] == '1')
        assertThat(afterPnoValue.isSent).isEqualTo(testCase.expectedAfterStateRepresentation[3] == '1')
        assertThat(afterPnoValue.isBeingSent).isEqualTo(testCase.expectedAfterStateRepresentation[4] == '1')
        assertThat(afterPriorNotification.state).isEqualTo(testCase.expectedAfterState)
    }
}
