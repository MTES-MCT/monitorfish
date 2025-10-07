package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
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
import org.springframework.data.domain.Sort
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationsUTests {
    @MockitoBean
    private lateinit var gearRepository: GearRepository

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @MockitoBean
    private lateinit var portRepository: PortRepository

    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockitoBean
    private lateinit var speciesRepository: SpeciesRepository

    @MockitoBean
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
    private val defaultPageSize = 10
    private val defaultPageNumber = 0

    @Test
    fun `execute Should return a list of prior notifications with their total length`() {
        // Given
        given(logbookReportRepository.findAllAcknowledgedPriorNotifications(defaultFilter)).willReturn(
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
                                    message = PNO(),
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
                                    message = PNO(),
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
            GetPriorNotifications(
                gearRepository,
                logbookReportRepository,
                manualPriorNotificationRepository,
                portRepository,
                reportingRepository,
                riskFactorRepository,
                speciesRepository,
                vesselRepository,
            ).execute(
                defaultFilter,
                defaultIsInvalidated,
                defaultIsPriorNotificationZero,
                defaultSeafrontGroup,
                defaultStates,
                defaultSortColumn,
                defaultSortDirection,
                defaultPageNumber,
                defaultPageSize,
            )

        // Then
        assertThat(result.data).hasSize(2)
        assertThat(
            result.data[0]
                .logbookMessageAndValue.logbookMessage.reportId,
        ).isEqualTo(
            "FAKE_REPORT_ID_1",
        )
        assertThat(
            result.data[1]
                .logbookMessageAndValue.logbookMessage.reportId,
        ).isEqualTo(
            "FAKE_REPORT_ID_2_COR",
        )
    }
}
