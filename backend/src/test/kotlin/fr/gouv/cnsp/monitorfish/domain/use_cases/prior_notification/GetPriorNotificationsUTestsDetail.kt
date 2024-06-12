package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.Sort
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationsUTestsDetail {
    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    private val defaultFilter = PriorNotificationsFilter(
        willArriveAfter = "2000-01-01T00:00:00Z",
        willArriveBefore = "2099-12-31T00:00:00Z",
    )
    private val defaultSortColumn = PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE
    private val defaultSortDirection = Sort.Direction.ASC
    private val defaultPageSize = 10
    private val defaultPageNumber = 0

    @Test
    fun `execute Should return a list of prior notifications with their total length`() {
        // Given
        given(logbookReportRepository.findAllPriorNotifications(defaultFilter)).willReturn(
            listOf(
                PriorNotification(
                    reportId = "FAKE_REPORT_ID_1",
                    authorTrigram = null,
                    createdAt = null,
                    didNotFishAfterZeroNotice = false,
                    isManuallyCreated = false,
                    logbookMessageTyped = LogbookMessageTyped(
                        clazz = PNO::class.java,
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = "FAKE_REPORT_ID_1",
                            referencedReportId = null,
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isCorrectedByNewerMessage = false,
                            isDeleted = false,
                            isEnriched = false,
                            message = PNO(),
                            operationDateTime = ZonedDateTime.now(),
                            operationNumber = "1",
                            operationType = LogbookOperationType.DAT,
                            reportDateTime = ZonedDateTime.now(),
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    note = null,
                    port = null,
                    reportingCount = null,
                    seafront = null,
                    sentAt = null,
                    updatedAt = null,
                    vessel = null,
                    vesselRiskFactor = null,
                ),

                PriorNotification(
                    reportId = "FAKE_REPORT_ID_2",
                    authorTrigram = null,
                    createdAt = null,
                    didNotFishAfterZeroNotice = false,
                    isManuallyCreated = false,
                    logbookMessageTyped = LogbookMessageTyped(
                        clazz = PNO::class.java,
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = "FAKE_REPORT_ID_2_COR",
                            referencedReportId = "FAKE_NONEXISTENT_REPORT_ID_2",
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isCorrectedByNewerMessage = false,
                            isDeleted = false,
                            isEnriched = false,
                            message = PNO(),
                            operationDateTime = ZonedDateTime.now(),
                            operationNumber = "1",
                            operationType = LogbookOperationType.COR,
                            reportDateTime = ZonedDateTime.now(),
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    note = null,
                    port = null,
                    reportingCount = null,
                    seafront = null,
                    sentAt = null,
                    updatedAt = null,
                    vessel = null,
                    vesselRiskFactor = null,
                ),
            ),
        )

        // When
        val result = GetPriorNotifications(
            gearRepository,
            logbookReportRepository,
            manualPriorNotificationRepository,
            portRepository,
            reportingRepository,
            riskFactorRepository,
            speciesRepository,
            vesselRepository,
        ).execute(defaultFilter, defaultSortColumn, defaultSortDirection)

        // Then
        assertThat(result).hasSize(2)
        assertThat(result[0].logbookMessageTyped.logbookMessage.reportId).isEqualTo(
            "FAKE_REPORT_ID_1",
        )
        assertThat(result[1].logbookMessageTyped.logbookMessage.reportId).isEqualTo(
            "FAKE_REPORT_ID_2_COR",
        )
    }
}
