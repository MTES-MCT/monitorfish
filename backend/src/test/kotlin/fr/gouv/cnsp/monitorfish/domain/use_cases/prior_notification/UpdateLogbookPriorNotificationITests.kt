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
            // Even if the forms are frozen when a prior notification is in pending (auto) send,
            // we still need to test these case here. The user may indeed be able to call this action
            // if its prior notification data is outdated.
            return Stream.of(
                // "00000" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "00001" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "00010" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "00100" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "00101" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "00110" -> "00000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ),
                // "01000" -> "01000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                // "01100" -> "01000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                // "01101" -> "01000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
                    PriorNotificationState.PENDING_VERIFICATION,
                ),
                // "01110" -> "01000"
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
                        isVerified = false,
                        isSent = false,
                        isBeingSent = false,
                    ),
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
