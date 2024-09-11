package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.domain.Sort
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
@Import(MapperConfiguration::class)
@SpringBootTest
class GetPriorNotificationsITests : AbstractDBTests() {
    @Autowired
    private lateinit var getPriorNotifications: GetPriorNotifications

    @Autowired
    private lateinit var gearRepository: GearRepository

    @Autowired
    private lateinit var logbookReportRepository: LogbookReportRepository

    @Autowired
    private lateinit var portRepository: PortRepository

    @Autowired
    private lateinit var reportingRepository: ReportingRepository

    @Autowired
    private lateinit var riskFactorRepository: RiskFactorRepository

    @Autowired
    private lateinit var speciesRepository: SpeciesRepository

    @Autowired
    private lateinit var vesselRepository: VesselRepository

    private val defaultFilter =
        PriorNotificationsFilter(
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2099-12-31T00:00:00Z",
        )
    private val defaultIsInvalidated = null
    private val defaultIsPriorNotificationZero = null
    private val defaultSeafrontGroup = SeafrontGroup.ALL
    private val defaultStates = null
    private val defaultSortColumn = PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE
    private val defaultSortDirection = Sort.Direction.ASC
    private val defaultPageSize = 100
    private val defaultPageNumber = 0

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by expected arrival date ascending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE
        val sortDirection = Sort.Direction.ASC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullArrivalDate =
            result.data
                .first { it.logbookMessageAndValue.value.predictedArrivalDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullArrivalDate.logbookMessageAndValue.value.predictedArrivalDatetimeUtc,
        )
            .isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by expected arrival date descending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE
        val sortDirection = Sort.Direction.DESC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullArrivalDate =
            result.data
                .first { it.logbookMessageAndValue.value.predictedArrivalDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullArrivalDate.logbookMessageAndValue.value.predictedArrivalDatetimeUtc,
        )
            .isAfter(ZonedDateTime.now().minusHours(1))
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by expected landing date ascending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.EXPECTED_LANDING_DATE
        val sortDirection = Sort.Direction.ASC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullLandingDate =
            result.data
                .first { it.logbookMessageAndValue.value.predictedLandingDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullLandingDate.logbookMessageAndValue.value.predictedLandingDatetimeUtc,
        )
            .isEqualTo(ZonedDateTime.parse("2023-01-01T10:30:00Z"))
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by expected landing date descending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.EXPECTED_LANDING_DATE
        val sortDirection = Sort.Direction.DESC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullLandingDate =
            result.data
                .first { it.logbookMessageAndValue.value.predictedLandingDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullLandingDate.logbookMessageAndValue.value.predictedLandingDatetimeUtc,
        )
            .isAfter(ZonedDateTime.now().plusHours(4))
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by port name ascending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.PORT_NAME
        val sortDirection = Sort.Direction.ASC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullPort = result.data.first { it.port != null }
        assertThat(firstPriorNotificationWithNonNullPort.port!!.name).isEqualTo("Al Jazeera Port")
        assertThat(firstPriorNotificationWithNonNullPort.logbookMessageAndValue.value.port).isEqualTo("AEJAZ")
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by port name descending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.PORT_NAME
        val sortDirection = Sort.Direction.DESC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullPort = result.data.first { it.port != null }
        assertThat(firstPriorNotificationWithNonNullPort.port!!.name).isEqualTo("Vannes")
        assertThat(firstPriorNotificationWithNonNullPort.logbookMessageAndValue.value.port).isEqualTo("FRVNE")
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by vessel name ascending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.VESSEL_NAME
        val sortDirection = Sort.Direction.ASC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithKnownVessel = result.data.first { it.vessel!!.id != -1 }
        // We don't test the `.vessel.VesselName` since in the real world,
        // the vessel name may have changed between the logbook message date and now
        assertThat(firstPriorNotificationWithKnownVessel.vessel!!.internalReferenceNumber).isEqualTo("CFR125")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageAndValue.logbookMessage.internalReferenceNumber)
            .isEqualTo("CFR125")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageAndValue.logbookMessage.vesselName)
            .isEqualTo("BEAU SÉANT")
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by vessel name descending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.VESSEL_NAME
        val sortDirection = Sort.Direction.DESC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithKnownVessel = result.data.first { it.vessel!!.id != -1 }
        // We don't test the `.vessel.VesselName` since in the real world,
        // the vessel name may have changed between the logbook message date and now
        assertThat(firstPriorNotificationWithKnownVessel.vessel!!.internalReferenceNumber).isEqualTo("CFR120")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageAndValue.logbookMessage.internalReferenceNumber)
            .isEqualTo("CFR120")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageAndValue.logbookMessage.vesselName)
            .isEqualTo("VIVA L'ITALIA")
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by risk factor ascending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.VESSEL_RISK_FACTOR
        val sortDirection = Sort.Direction.ASC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullRiskFactor =
            result.data.first { it.logbookMessageAndValue.value.riskFactor != null }
        assertThat(firstPriorNotificationWithNonNullRiskFactor.logbookMessageAndValue.value.riskFactor!!).isEqualTo(
            1.5,
        )
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of prior notifications sorted by vessel risk factor descending`() {
        // Given
        val sortColumn = PriorNotificationsSortColumn.VESSEL_RISK_FACTOR
        val sortDirection = Sort.Direction.DESC

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    sortColumn,
                    sortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val firstPriorNotificationWithNonNullRiskFactor =
            result.data.first { it.logbookMessageAndValue.value.riskFactor != null }
        assertThat(firstPriorNotificationWithNonNullRiskFactor.logbookMessageAndValue.value.riskFactor!!).isEqualTo(
            3.9,
        )
        assertThat(result.data).hasSizeGreaterThan(0)
    }

    @Test
    @Transactional
    fun `execute Should return a list of NAMO seafront group prior notifications`() {
        // Given
        val seafrontGroup = SeafrontGroup.NAMO

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    seafrontGroup,
                    defaultStates,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        assertThat(result.data).hasSizeGreaterThan(0)
        assertThat(result.data.all { it.seafront === Seafront.NAMO }).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of pending sent and out of verification scope prior notifications`() {
        // Given
        val states = listOf(PriorNotificationState.PENDING_SEND, PriorNotificationState.OUT_OF_VERIFICATION_SCOPE)

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    states,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        assertThat(result.data).hasSizeGreaterThan(0)
        assertThat(
            result.data.all {
                listOf(
                    PriorNotificationState.PENDING_SEND,
                    PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                ).contains(it.state)
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of invalidated prior notifications`() {
        // Given
        val isInvalidated = true

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    isInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        assertThat(result.data).hasSizeGreaterThan(0)
        assertThat(result.data.all { it.logbookMessageAndValue.value.isInvalidated == true }).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of either pending send or invalidated prior notifications`() {
        // Given
        val isInvalidated = true
        val states = listOf(PriorNotificationState.PENDING_SEND)

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    isInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    states,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val invalidatedPriorNotifications = result.data.filter { it.logbookMessageAndValue.value.isInvalidated == true }
        val pendingSendPriorNotifications = result.data.filter { it.state == PriorNotificationState.PENDING_SEND }
        val pendingSendPriorNotificationReportIds = pendingSendPriorNotifications.map { it.reportId!! }
        assertThat(invalidatedPriorNotifications).hasSizeGreaterThan(0)
        assertThat(pendingSendPriorNotifications).hasSizeGreaterThan(0)
        assertThat(
            invalidatedPriorNotifications.none { pendingSendPriorNotificationReportIds.contains(it.reportId!!) },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of Zero prior notifications`() {
        // Given
        val isPriorNotificationZero = true

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    isPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        assertThat(result.data).hasSizeGreaterThan(0)
        assertThat(result.data.all { it.isPriorNotificationZero == true }).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of either pending send or Zero prior notifications`() {
        // Given
        val isPriorNotificationZero = true
        val states = listOf(PriorNotificationState.FAILED_SEND)

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    isPriorNotificationZero,
                    defaultSeafrontGroup,
                    states,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val zeroPriorNotifications = result.data.filter { it.isPriorNotificationZero == true }
        val failedSendPriorNotifications = result.data.filter { it.state == PriorNotificationState.FAILED_SEND }
        val failedSendPriorNotificationReportIds = failedSendPriorNotifications.map { it.reportId!! }
        assertThat(zeroPriorNotifications).hasSizeGreaterThan(0)
        assertThat(failedSendPriorNotifications).hasSizeGreaterThan(0)
        assertThat(
            zeroPriorNotifications.none { failedSendPriorNotificationReportIds.contains(it.reportId!!) },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should return a list of either pending send or invalidated or Zero prior notifications`() {
        // Given
        val isInvalidated = true
        val isPriorNotificationZero = true
        val states = listOf(PriorNotificationState.OUT_OF_VERIFICATION_SCOPE)

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    isInvalidated,
                    isPriorNotificationZero,
                    defaultSeafrontGroup,
                    states,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    defaultPageSize,
                )

        // Then
        val invalidatedPriorNotifications = result.data.filter { it.logbookMessageAndValue.value.isInvalidated == true }
        val invalidatedPriorNotificationsIds = invalidatedPriorNotifications.map { it.reportId!! }
        val zeroPriorNotifications = result.data.filter { it.isPriorNotificationZero == true }
        val zeroPriorNotificationIds = zeroPriorNotifications.map { it.reportId!! }
        val outOfVerificationScopePriorNotifications =
            result.data.filter { it.state == PriorNotificationState.OUT_OF_VERIFICATION_SCOPE }
        val outOfVerificationScopePriorNotificationReportIds =
            outOfVerificationScopePriorNotifications.map { it.reportId!! }
        assertThat(invalidatedPriorNotifications).hasSizeGreaterThan(0)
        assertThat(zeroPriorNotificationIds).hasSizeGreaterThan(0)
        assertThat(outOfVerificationScopePriorNotifications).hasSizeGreaterThan(0)
        assertThat(
            invalidatedPriorNotifications.none {
                outOfVerificationScopePriorNotificationReportIds.contains(it.reportId!!) ||
                    zeroPriorNotificationIds.contains(it.reportId!!)
            },
        ).isTrue()
        assertThat(
            zeroPriorNotifications.none {
                outOfVerificationScopePriorNotificationReportIds.contains(it.reportId!!) ||
                    invalidatedPriorNotificationsIds.contains(it.reportId!!)
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `execute Should exclude foreign ports unless they are French vessels`() {
        // Given
        val pageSize = 100

        // When
        val result =
            getPriorNotifications
                .execute(
                    defaultFilter,
                    defaultIsInvalidated,
                    defaultIsPriorNotificationZero,
                    defaultSeafrontGroup,
                    defaultStates,
                    defaultSortColumn,
                    defaultSortDirection,
                    defaultPageNumber,
                    pageSize,
                )

        // Then
        assertThat(result.data).hasSizeGreaterThan(0)
        // Australian vessel landing in an Australian port
        assertThat(result.data.none { it.vessel!!.vesselName == "THE FLOATING KANGAROO" }).isTrue()
        // French vessel Landing in a Brazilian port
        assertThat(result.data.any { it.vessel!!.vesselName == "BON VENT" }).isTrue()
    }
}
