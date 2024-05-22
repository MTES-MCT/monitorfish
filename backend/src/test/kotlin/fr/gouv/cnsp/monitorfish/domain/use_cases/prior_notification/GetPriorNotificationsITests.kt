package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.sorters.LogbookReportSortColumn
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

    private val defaultFilter = LogbookReportFilter(
        willArriveAfter = "2000-01-01T00:00:00Z",
        willArriveBefore = "2099-12-31T00:00:00Z",
    )
    private val defaultSortColumn = LogbookReportSortColumn.EXPECTED_ARRIVAL_DATE
    private val defaultSortDirection = Sort.Direction.ASC
    private val defaultPageSize = 10
    private val defaultPageNumber = 0

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by expected arrival date ascending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.EXPECTED_ARRIVAL_DATE
        val sortDirection = Sort.Direction.ASC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullArrivalDate = priorNotifications
            .first { it.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullArrivalDate.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc,
        )
            .isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by expected arrival date descending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.EXPECTED_ARRIVAL_DATE
        val sortDirection = Sort.Direction.DESC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullArrivalDate = priorNotifications
            .first { it.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullArrivalDate.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc,
        )
            .isAfter(ZonedDateTime.now().minusHours(1))
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by expected landing date ascending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.EXPECTED_LANDING_DATE
        val sortDirection = Sort.Direction.ASC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullLandingDate = priorNotifications
            .first { it.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullLandingDate.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc,
        )
            .isEqualTo(ZonedDateTime.parse("2024-03-01T17:30:00Z"))
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by expected landing date descending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.EXPECTED_LANDING_DATE
        val sortDirection = Sort.Direction.DESC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullLandingDate = priorNotifications
            .first { it.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc != null }
        assertThat(
            firstPriorNotificationWithNonNullLandingDate.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc,
        )
            .isAfter(ZonedDateTime.now().plusHours(4))
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by port name ascending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.PORT_NAME
        val sortDirection = Sort.Direction.ASC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullPort = priorNotifications.first { it.port != null }
        assertThat(firstPriorNotificationWithNonNullPort.port!!.name).isEqualTo("Al Jazeera Port")
        assertThat(firstPriorNotificationWithNonNullPort.logbookMessageTyped.typedMessage.port).isEqualTo("AEJAZ")
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by port name descending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.PORT_NAME
        val sortDirection = Sort.Direction.DESC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullPort = priorNotifications.first { it.port != null }
        assertThat(firstPriorNotificationWithNonNullPort.port!!.name).isEqualTo("Vannes")
        assertThat(firstPriorNotificationWithNonNullPort.logbookMessageTyped.typedMessage.port).isEqualTo("FRVNE")
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by vessel name ascending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.VESSEL_NAME
        val sortDirection = Sort.Direction.ASC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithKnownVessel = priorNotifications.first { it.vessel.id != -1 }
        // We don't test the `.vessel.VesselName` since in the real world,
        // the vessel name may have changed between the logbook message date and now
        assertThat(firstPriorNotificationWithKnownVessel.vessel.internalReferenceNumber).isEqualTo("CFR105")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageTyped.logbookMessage.internalReferenceNumber)
            .isEqualTo("CFR105")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageTyped.logbookMessage.vesselName)
            .isEqualTo("CALAMARO")
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by vessel name descending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.VESSEL_NAME
        val sortDirection = Sort.Direction.DESC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithKnownVessel = priorNotifications.first { it.vessel.id != -1 }
        // We don't test the `.vessel.VesselName` since in the real world,
        // the vessel name may have changed between the logbook message date and now
        assertThat(firstPriorNotificationWithKnownVessel.vessel.internalReferenceNumber).isEqualTo("CFR101")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageTyped.logbookMessage.internalReferenceNumber)
            .isEqualTo("CFR101")
        assertThat(firstPriorNotificationWithKnownVessel.logbookMessageTyped.logbookMessage.vesselName)
            .isEqualTo("VIVA ESPANA")
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by vessel risk factor ascending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.VESSEL_RISK_FACTOR
        val sortDirection = Sort.Direction.ASC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullRiskFactor = priorNotifications.first { it.vesselRiskFactor != null }
        assertThat(firstPriorNotificationWithNonNullRiskFactor.vesselRiskFactor!!.riskFactor).isEqualTo(2.473)
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a list of prior notifications sorted by vessel risk factor descending`() {
        // Given
        val sortColumn = LogbookReportSortColumn.VESSEL_RISK_FACTOR
        val sortDirection = Sort.Direction.DESC

        // When
        val result = getPriorNotifications
            .execute(defaultFilter, sortColumn, sortDirection, defaultPageSize, defaultPageNumber)

        // Then
        val (priorNotifications, totalLength) = result
        val firstPriorNotificationWithNonNullRiskFactor = priorNotifications.first { it.vesselRiskFactor != null }
        assertThat(firstPriorNotificationWithNonNullRiskFactor.vesselRiskFactor!!.riskFactor).isEqualTo(4.0)
        assertThat(priorNotifications).hasSize(10)
        assertThat(totalLength).isEqualTo(14)
    }

    @Test
    @Transactional
    fun `execute should return a paginated list of prior notifications`() {
        // Given
        val pageSize = 10
        val firstPageNumber = 0

        // When
        val firstPageResult = getPriorNotifications
            .execute(defaultFilter, defaultSortColumn, defaultSortDirection, pageSize, firstPageNumber)

        // Then
        val (firstPagePriorNotifications, firstPageTotalLength) = firstPageResult
        assertThat(firstPagePriorNotifications).hasSize(10)
        assertThat(firstPageTotalLength).isEqualTo(14)

        // Given
        val secondPageNumber = 1

        // When
        val secondPageResult = getPriorNotifications
            .execute(defaultFilter, defaultSortColumn, defaultSortDirection, pageSize, secondPageNumber)

        // Then
        val (secondPagePriorNotifications, secondPageTotalLength) = secondPageResult
        assertThat(secondPagePriorNotifications).hasSize(4)
        val firstPagePriorNotificationIds = firstPagePriorNotifications.map { it.logbookMessageTyped.logbookMessage.id }
        assertThat(
            secondPagePriorNotifications
                .none { it.logbookMessageTyped.logbookMessage.id in firstPagePriorNotificationIds },
        ).isTrue()
        assertThat(secondPageTotalLength).isEqualTo(14)

        // Given
        val thirdPageNumber = 2

        // When
        val thirdPageResult = getPriorNotifications
            .execute(defaultFilter, defaultSortColumn, defaultSortDirection, pageSize, thirdPageNumber)

        // Then
        val (thirdPagePriorNotifications, thirdPageTotalLength) = thirdPageResult
        assertThat(thirdPagePriorNotifications).isEmpty()
        assertThat(thirdPageTotalLength).isEqualTo(14)
    }
}
