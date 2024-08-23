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

    data class BooleanState(
        val isManualPriorNotification: Boolean,
        val isInVerificationScope: Boolean,
        val isVerified: Boolean,
        val isSent: Boolean,
        val isBeingSent: Boolean,
    )

    data class TestCase(
        val reportId: String,
        val beforeBooleanState: BooleanState,
        val beforeState: PriorNotificationState,
        val expectedAfterBooleanState: BooleanState,
        val expectedAfterState: PriorNotificationState,
    )

    companion object {
        @JvmStatic
        fun getTestCases(): Stream<TestCase> {
            return Stream.of(
                // -------------------------------------------------------------
                // Logbook prior notifications

                // "00000" -> "00101"
                TestCase(
                    "FAKE_OPERATION_101",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "00001" -> "00101"
                TestCase(
                    "FAKE_OPERATION_102",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_AUTO_SEND,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "00010" -> "00101"
                TestCase(
                    "FAKE_OPERATION_103",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.AUTO_SEND_DONE,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "00100" -> "00101"
                TestCase(
                    "FAKE_OPERATION_104",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.FAILED_SEND,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "00101" -> "00101"
                TestCase(
                    "FAKE_OPERATION_105",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "00110" -> "00101"
                TestCase(
                    "FAKE_OPERATION_106",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.VERIFIED_AND_SENT,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "01000" -> "01101"
                TestCase(
                    "FAKE_OPERATION_107",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.PENDING_VERIFICATION,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "01100" -> "01101"
                TestCase(
                    "FAKE_OPERATION_108",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.FAILED_SEND,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "01101" -> "01101"
                TestCase(
                    "FAKE_OPERATION_109_COR",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "01110" -> "01101"
                TestCase(
                    "FAKE_OPERATION_110",
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.VERIFIED_AND_SENT,
                    BooleanState(
                        isManualPriorNotification = false,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // -------------------------------------------------------------
                // Manual prior notifications

                // "10000" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000001",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "10001" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000002",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_AUTO_SEND,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "10010" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000003",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = false,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.AUTO_SEND_DONE,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "10100" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000004",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.FAILED_SEND,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "10101" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000005",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "10110" -> "10101"
                TestCase(
                    "00000000-0000-4000-0000-000000000006",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.VERIFIED_AND_SENT,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = false,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "11000" -> "11101"
                TestCase(
                    "00000000-0000-4000-0000-000000000007",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.PENDING_VERIFICATION,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "11100" -> "11101"
                TestCase(
                    "00000000-0000-4000-0000-000000000008",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.FAILED_SEND,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "11101" -> "11101"
                TestCase(
                    "00000000-0000-4000-0000-000000000009",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
                    PriorNotificationState.PENDING_SEND,
                ),

                // "11110" -> "11101"
                TestCase(
                    "00000000-0000-4000-0000-000000000010",
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = true,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.VERIFIED_AND_SENT,
                    BooleanState(
                        isManualPriorNotification = true,
                        isInVerificationScope = true,
                        isVerified = true,
                        isSent = false,
                        isBeingSent = true,
                    ),
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
        val isManuallyCreated = testCase.beforeBooleanState.isManualPriorNotification

        // Before
        val beforePriorNotification = getPriorNotification.execute(reportId, operationDate, isManuallyCreated)

        val beforePnoValue = beforePriorNotification.logbookMessageAndValue.value
        assertThat(beforePnoValue.isInVerificationScope).isEqualTo(testCase.beforeBooleanState.isInVerificationScope)
        assertThat(beforePnoValue.isVerified).isEqualTo(testCase.beforeBooleanState.isVerified)
        assertThat(beforePnoValue.isSent).isEqualTo(testCase.beforeBooleanState.isSent)
        assertThat(beforePnoValue.isBeingSent).isEqualTo(testCase.beforeBooleanState.isBeingSent)
        assertThat(beforePriorNotification.state).isEqualTo(testCase.beforeState)

        // When
        val afterPriorNotification = verifyAndSendPriorNotification.execute(reportId, operationDate, isManuallyCreated)

        // Then
        val afterPnoValue = afterPriorNotification.logbookMessageAndValue.value
        assertThat(afterPriorNotification.reportId).isEqualTo(testCase.reportId)
        assertThat(afterPriorNotification.isManuallyCreated)
            .isEqualTo(testCase.expectedAfterBooleanState.isManualPriorNotification)
        assertThat(afterPnoValue.isInVerificationScope).isEqualTo(
            testCase.expectedAfterBooleanState.isInVerificationScope,
        )
        assertThat(afterPnoValue.isVerified).isEqualTo(testCase.expectedAfterBooleanState.isVerified)
        assertThat(afterPnoValue.isSent).isEqualTo(testCase.expectedAfterBooleanState.isSent)
        assertThat(afterPnoValue.isBeingSent).isEqualTo(testCase.expectedAfterBooleanState.isBeingSent)
        assertThat(afterPriorNotification.state).isEqualTo(testCase.expectedAfterState)
    }
}
