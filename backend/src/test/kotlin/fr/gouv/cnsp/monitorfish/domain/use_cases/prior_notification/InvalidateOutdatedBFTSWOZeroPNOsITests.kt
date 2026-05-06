package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.stream.Stream

@ExtendWith(SpringExtension::class)
@Import(MapperConfiguration::class)
@SpringBootTest
class InvalidateOutdatedBFTSWOZeroPNOsITests : AbstractDBTests() {
    @Autowired
    private lateinit var invalidateOutdatedBFTSWOZeroPNOs: InvalidateOutdatedBFTSWOZeroPNOs

    @Autowired
    private lateinit var getPriorNotification: GetPriorNotification

    data class BooleanState(
        val isManualPriorNotification: Boolean,
        val isInvalidated: Boolean?,
    )

    data class TestCase(
        val reportId: String,
        val operationDate: ZonedDateTime,
        val beforeBooleanState: BooleanState,
        val afterBooleanState: BooleanState,
    )

    companion object {
        @JvmStatic
        fun getTestCases(): Stream<TestCase> =
            Stream.of(
                TestCase(
                    "00000000-0000-4000-0000-000000000013",
                    ZonedDateTime.now(ZoneOffset.UTC).minusHours(25),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = true,
                    ),
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000015",
                    ZonedDateTime.now(ZoneOffset.UTC).minusHours(25),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000016",
                    ZonedDateTime.now(ZoneOffset.UTC).minusHours(25),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                ),
                TestCase(
                    "00000000-0000-4000-0000-000000000017",
                    ZonedDateTime.now(ZoneOffset.UTC).minusHours(25),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                    BooleanState(
                        isManualPriorNotification = true,
                        isInvalidated = null,
                    ),
                ),
            )
    }

    @ParameterizedTest
    @MethodSource("getTestCases")
    @Transactional
    fun `Should invalidate prior notifications as expected`(testCase: TestCase) {
        // Given
        val reportId = testCase.reportId
        val operationDate = testCase.operationDate
        val isManuallyCreated = testCase.beforeBooleanState.isManualPriorNotification

        // Before
        val beforePriorNotification = getPriorNotification.execute(reportId, operationDate, isManuallyCreated)

        val beforePnoValue = beforePriorNotification.logbookMessageAndValue.value
        assertThat(beforePnoValue.isInvalidated).isEqualTo(testCase.beforeBooleanState.isInvalidated)

        // When
        invalidateOutdatedBFTSWOZeroPNOs.execute()

        // Then
        val afterPriorNotification = getPriorNotification.execute(reportId, operationDate, isManuallyCreated)
        val afterPnoValue = afterPriorNotification.logbookMessageAndValue.value
        assertThat(afterPnoValue.isInvalidated).isEqualTo(testCase.afterBooleanState.isInvalidated)
    }
}
