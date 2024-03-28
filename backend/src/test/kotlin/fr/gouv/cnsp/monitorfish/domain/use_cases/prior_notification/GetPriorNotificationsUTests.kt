package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.ConsolidatedLogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationsUTests {
    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var speciesRepository: SpeciesRepository

    @Test
    fun `execute Should return a list of prior notifications`() {
        // Given
        given(logbookReportRepository.findAllPriorNotifications(LogbookReportFilter())).willReturn(
            listOf(
                PriorNotification(
                    reportId = "FAKE_REPORT_ID_1",
                    consolidatedLogbookMessage = ConsolidatedLogbookMessage(
                        clazz = PNO::class.java,
                        reportId = "FAKE_REPORT_ID_1",
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = "FAKE_REPORT_ID_1",
                            referencedReportId = null,
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isEnriched = false,
                            message = PNO(),
                            operationDateTime = ZonedDateTime.now(),
                            operationNumber = "1",
                            operationType = LogbookOperationType.DAT,
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    reportingsCount = null,
                    seaFront = null,
                    vessel = Vessel(
                        id = 1,
                        externalReferenceNumber = null,
                        flagState = CountryCode.FR,
                        internalReferenceNumber = null,
                        ircs = null,
                        length = null,
                        mmsi = null,
                        underCharter = null,
                        vesselName = null,
                    ),
                    vesselRiskFactor = null,
                ),

                PriorNotification(
                    reportId = "FAKE_REPORT_ID_2",
                    consolidatedLogbookMessage = ConsolidatedLogbookMessage(
                        clazz = PNO::class.java,
                        reportId = "FAKE_REPORT_ID_2",
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = null,
                            referencedReportId = "FAKE_REPORT_ID_2",
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isEnriched = false,
                            message = PNO(),
                            operationDateTime = ZonedDateTime.now(),
                            operationNumber = "1",
                            operationType = LogbookOperationType.COR,
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    reportingsCount = null,
                    seaFront = null,
                    vessel = Vessel(
                        id = 2,
                        externalReferenceNumber = null,
                        flagState = CountryCode.UK,
                        internalReferenceNumber = null,
                        ircs = null,
                        length = null,
                        mmsi = null,
                        underCharter = null,
                        vesselName = null,
                    ),
                    vesselRiskFactor = null,
                ),
            ),
        )

        // When
        val result = GetPriorNotifications(
            gearRepository,
            logbookReportRepository,
            portRepository,
            reportingRepository,
            speciesRepository,
        ).execute(LogbookReportFilter())

        // Then
        Assertions.assertThat(result).hasSize(2)
        Assertions.assertThat(result[0].reportId).isEqualTo("FAKE_REPORT_ID_1")
        Assertions.assertThat(result[1].reportId).isEqualTo("FAKE_REPORT_ID_2")
    }
}
