package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetPriorNotificationUTests {
    @MockBean
    private lateinit var gearRepository: GearRepository

    @MockBean
    private lateinit var logbookReportRepository: LogbookReportRepository

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

    @Test
    fun `execute Should return a prior notification with a non-corrected logbook report operation`() {
        // Given
        given(logbookReportRepository.findPriorNotificationByReportId("FAKE_REPORT_ID_1")).willReturn(
            PriorNotification(
                logbookMessageTyped = LogbookMessageTyped(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessage(
                        id = 1,
                        reportId = "FAKE_REPORT_ID_1",
                        referencedReportId = null,
                        analyzedByRules = emptyList(),
                        isDeleted = false,
                        integrationDateTime = ZonedDateTime.now(),
                        isCorrectedByNewerMessage = false,
                        isEnriched = true,
                        message = PNO(),
                        messageType = "PNO",
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "1",
                        operationType = LogbookOperationType.DAT,
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
                ),
                reportingsCount = null,
                seafront = null,
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
        )

        // When
        val result = GetPriorNotification(
            gearRepository,
            logbookReportRepository,
            portRepository,
            reportingRepository,
            riskFactorRepository,
            speciesRepository,
            vesselRepository,
        ).execute("FAKE_REPORT_ID_1")

        // Then
        Assertions.assertThat(result.logbookMessageTyped.logbookMessage.reportId).isEqualTo("FAKE_REPORT_ID_1")
        Assertions.assertThat(result.logbookMessageTyped.logbookMessage.referencedReportId).isNull()
    }

    @Test
    fun `execute Should return a prior notification with a corrected logbook report operation`() {
        // Given
        given(logbookReportRepository.findPriorNotificationByReportId("FAKE_REPORT_ID_2")).willReturn(
            PriorNotification(
                logbookMessageTyped = LogbookMessageTyped(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessage(
                        id = 2,
                        reportId = null,
                        referencedReportId = "FAKE_REPORT_ID_2",
                        analyzedByRules = emptyList(),
                        isDeleted = false,
                        integrationDateTime = ZonedDateTime.now(),
                        isCorrectedByNewerMessage = true,
                        isEnriched = true,
                        message = PNO(),
                        messageType = "PNO",
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "2",
                        operationType = LogbookOperationType.COR,
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
                ),
                reportingsCount = null,
                seafront = null,
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
        )

        // When
        val result = GetPriorNotification(
            gearRepository,
            logbookReportRepository,
            portRepository,
            reportingRepository,
            riskFactorRepository,
            speciesRepository,
            vesselRepository,
        ).execute("FAKE_REPORT_ID_2")

        // Then
        Assertions.assertThat(result.logbookMessageTyped.logbookMessage.reportId).isNull()
        Assertions.assertThat(result.logbookMessageTyped.logbookMessage.referencedReportId)
            .isEqualTo("FAKE_REPORT_ID_2")
    }
}
