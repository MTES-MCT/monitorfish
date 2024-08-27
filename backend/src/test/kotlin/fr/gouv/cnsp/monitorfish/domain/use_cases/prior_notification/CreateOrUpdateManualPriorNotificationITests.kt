package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.stream.Stream

@ExtendWith(SpringExtension::class)
@Import(MapperConfiguration::class)
@SpringBootTest
class CreateOrUpdateManualPriorNotificationITests : AbstractDBTests() {
    @Autowired
    private lateinit var createOrUpdateManualPriorNotification: CreateOrUpdateManualPriorNotification

    @Autowired
    private lateinit var gearRepository: GearRepository

    @Autowired
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @Autowired
    private lateinit var pnoPortSubscriptionRepository: PnoPortSubscriptionRepository

    @Autowired
    private lateinit var pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository

    @Autowired
    private lateinit var pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository

    @Autowired
    private lateinit var portRepository: PortRepository

    @Autowired
    private lateinit var priorNotificationPdfDocumentRepository: PriorNotificationPdfDocumentRepository

    @Autowired
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var computeManualPriorNotification: ComputeManualPriorNotification

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
    )

    companion object {
        @JvmStatic
        fun getOutOfVerificationScopeTestCases(): Stream<TestCase> {
            // Even if the forms are frozen when a prior notification is in pending (auto) send,
            // we still need to test these case here. The user may indeed be able to call this action
            // if its prior notification data is outdated.
            return Stream.of(
                // "10000" -> "10000"
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
                ),
                // "10001" -> "10000"
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
                ),
                // "10010" -> "10000"
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
                ),
                // "10100" -> "10000"
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
                ),
                // "10101" -> "10000"
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
                ),
                // "10110" -> "10000"
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
                ),
                // "11000" -> "10000"
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
                ),
                // "11100" -> "10000"
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
                ),
                // "11101" -> "10000"
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
                ),
                // "11110" -> "10000"
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
                ),
            )
        }

        @JvmStatic
        fun getInVerificationScopeTestCases(): Stream<TestCase> {
            // Even if the forms are frozen when a prior notification is in pending (auto) send,
            // we still need to test these case here. The user may indeed be able to call this action
            // if its prior notification data is outdated.
            return Stream.of(
                // "10000" -> "11000"
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
                ),
                // "10001" -> "11000"
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
                ),
                // "10010" -> "11000"
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
                ),
                // "10100" -> "11000"
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
                ),
                // "10101" -> "11000"
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
                ),
                // "10110" -> "11000"
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
                ),
                // "11000" -> "11000"
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
                ),
                // "11100" -> "11000"
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
                ),
                // "11101" -> "11000"
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
                ),
                // "11110" -> "11000"
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
                ),
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getOutOfVerificationScopeTestCases")
    @Transactional
    fun `Should transition manual prior notification states as expected (out of verification scope)`(testCase: TestCase) {
        // Given
        val reportId = testCase.reportId

        given { computeManualPriorNotification.execute(any(), any(), any(), any(), any()) }
            .willReturn(
                ManualPriorNotificationComputedValues(
                    isVesselUnderCharter = false,
                    nextState = PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselRiskFactor = 0.0,
                ),
            )

        // When
        val afterPriorNotification = createOrUpdateManualPriorNotification.execute(
            reportId = reportId,

            authorTrigram = "ABC",
            didNotFishAfterZeroNotice = false,
            expectedArrivalDate = ZonedDateTime.now(),
            expectedLandingDate = ZonedDateTime.now(),
            globalFaoArea = "FAKE_FAO_AREA",
            fishingCatches = emptyList(),
            hasPortEntranceAuthorization = false,
            hasPortLandingAuthorization = false,
            note = null,
            portLocode = "FRVNE",
            purpose = LogbookMessagePurpose.LAN,
            sentAt = ZonedDateTime.now(),
            tripGearCodes = emptyList(),
            vesselId = 1,
        )

        // Then
        val afterPnoValue = afterPriorNotification.logbookMessageAndValue.value
        assertThat(afterPriorNotification.reportId).isEqualTo(testCase.reportId)
        assertThat(afterPriorNotification.isManuallyCreated).isEqualTo(true)
        assertThat(afterPnoValue.isInVerificationScope).isEqualTo(false)
        assertThat(afterPnoValue.isVerified).isEqualTo(false)
        assertThat(afterPnoValue.isSent).isEqualTo(false)
        assertThat(afterPnoValue.isBeingSent).isEqualTo(false)
        assertThat(afterPriorNotification.state).isEqualTo(PriorNotificationState.OUT_OF_VERIFICATION_SCOPE)
    }

    @ParameterizedTest
    @MethodSource("getInVerificationScopeTestCases")
    @Transactional
    fun `Should transition manual prior notification states as expected (in verification scope)`(testCase: TestCase) {
        // Given
        val reportId = testCase.reportId

        given { computeManualPriorNotification.execute(any(), any(), any(), any(), any()) }
            .willReturn(
                ManualPriorNotificationComputedValues(
                    isVesselUnderCharter = false,
                    nextState = PriorNotificationState.PENDING_VERIFICATION,
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselRiskFactor = 5.0,
                ),
            )

        // When
        val afterPriorNotification = createOrUpdateManualPriorNotification.execute(
            reportId = reportId,

            authorTrigram = "ABC",
            didNotFishAfterZeroNotice = false,
            expectedArrivalDate = ZonedDateTime.now(),
            expectedLandingDate = ZonedDateTime.now(),
            globalFaoArea = "FAKE_FAO_AREA",
            fishingCatches = emptyList(),
            hasPortEntranceAuthorization = false,
            hasPortLandingAuthorization = false,
            note = null,
            portLocode = "FRVNE",
            purpose = LogbookMessagePurpose.LAN,
            sentAt = ZonedDateTime.now(),
            tripGearCodes = emptyList(),
            vesselId = 1,
        )

        // Then
        val afterPnoValue = afterPriorNotification.logbookMessageAndValue.value
        assertThat(afterPriorNotification.reportId).isEqualTo(testCase.reportId)
        assertThat(afterPriorNotification.isManuallyCreated).isEqualTo(true)
        assertThat(afterPnoValue.isInVerificationScope).isEqualTo(true)
        assertThat(afterPnoValue.isVerified).isEqualTo(false)
        assertThat(afterPnoValue.isSent).isEqualTo(false)
        assertThat(afterPnoValue.isBeingSent).isEqualTo(false)
        assertThat(afterPriorNotification.state).isEqualTo(PriorNotificationState.PENDING_VERIFICATION)
    }
}
