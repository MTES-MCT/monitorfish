package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
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
class VerifyAndSendPriorNotificationITests : AbstractDBTests() {
    @Autowired
    private lateinit var verifyAndSendPriorNotification: VerifyAndSendPriorNotification

    @Autowired
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Autowired
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

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
            return Stream.of(
                // Logbook prior notifications

                TestCase(
                    "FAKE_OPERATION_101",
                    "00000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_102",
                    "00001",
                    PriorNotificationState.PENDING_AUTO_SEND,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_103",
                    "00010",
                    PriorNotificationState.AUTO_SEND_DONE,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_104",
                    "00100",
                    PriorNotificationState.FAILED_SEND,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_105",
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_106",
                    "00110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "00101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_107",
                    "01000",
                    PriorNotificationState.PENDING_VERIFICATION,
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_108",
                    "01100",
                    PriorNotificationState.FAILED_SEND,
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_109_COR",
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "FAKE_OPERATION_110",
                    "01110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "01101",
                    PriorNotificationState.PENDING_SEND,
                ),

                // Manual prior notifications

                TestCase(
                    "00000000-0000-4000-0000-000000000001",
                    "10000",
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000002",
                    "10001",
                    PriorNotificationState.PENDING_AUTO_SEND,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000003",
                    "10010",
                    PriorNotificationState.AUTO_SEND_DONE,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000004",
                    "10100",
                    PriorNotificationState.FAILED_SEND,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000005",
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000006",
                    "10110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "10101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000007",
                    "11000",
                    PriorNotificationState.PENDING_VERIFICATION,
                    "11101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000008",
                    "11100",
                    PriorNotificationState.FAILED_SEND,
                    "11101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000009",
                    "11101",
                    PriorNotificationState.PENDING_SEND,
                    "11101",
                    PriorNotificationState.PENDING_SEND,
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000010",
                    "11110",
                    PriorNotificationState.VERIFIED_AND_SENT,
                    "11101",
                    PriorNotificationState.PENDING_SEND,
                ),
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getTestCases")
    @Transactional
    fun `Should transition prior notification states as expected`(testCase: TestCase) {
        // Given
        val reportId = testCase.reportId
        val operationDate = CustomZonedDateTime.now().toZonedDateTime()
        val isManuallyCreated = testCase.beforeStateRepresentation[0] == '1'

        // Before
        val beforePriorNotification = getPriorNotification.execute(reportId, operationDate, isManuallyCreated)

        val beforePnoValue = beforePriorNotification.logbookMessageAndValue.value
        assertThat(beforePnoValue.isInVerificationScope).isEqualTo(testCase.beforeStateRepresentation[1] == '1')
        assertThat(beforePnoValue.isVerified).isEqualTo(testCase.beforeStateRepresentation[2] == '1')
        assertThat(beforePnoValue.isSent).isEqualTo(testCase.beforeStateRepresentation[3] == '1')
        assertThat(beforePnoValue.isBeingSent).isEqualTo(testCase.beforeStateRepresentation[4] == '1')
        assertThat(beforePriorNotification.state).isEqualTo(testCase.beforeState)

        // When
        val afterPriorNotification = verifyAndSendPriorNotification.execute(reportId, operationDate, isManuallyCreated)

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
