package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.ConsolidatedLogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(PriorNotificationController::class)])
class PriorNotificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var getPriorNotifications: GetPriorNotifications

    @Test
    fun `Should get a list of prior notifications`() {
        // Given
        given(this.getPriorNotifications.execute(LogbookReportFilter())).willReturn(
            listOf(
                PriorNotification(
                    consolidatedLogbookMessage = ConsolidatedLogbookMessage(
                        clazz = PNO::class.java,
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = "FAKE_REPORT_ID_1",
                            referencedReportId = null,
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isConsolidated = true,
                            isCorrected = false,
                            isDeleted = false,
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
                    consolidatedLogbookMessage = ConsolidatedLogbookMessage(
                        clazz = PNO::class.java,
                        logbookMessage = LogbookMessage(
                            id = 1,
                            reportId = "FAKE_REPORT_ID_2",
                            referencedReportId = null,
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isConsolidated = true,
                            isCorrected = true,
                            isDeleted = false,
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
                        id = 1,
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
        api.perform(get("/bff/v1/prior_notifications"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].id", equalTo("FAKE_REPORT_ID_1")))
            .andExpect(jsonPath("$[1].id", equalTo("FAKE_REPORT_ID_2")))
    }

    @Test
    fun `Should get a prior notification by its (logbook report) ID`() {
        // Given
        given(this.getPriorNotification.execute("FAKE_REPORT_ID_1")).willReturn(
            PriorNotification(
                consolidatedLogbookMessage = ConsolidatedLogbookMessage(
                    clazz = PNO::class.java,
                    logbookMessage = LogbookMessage(
                        id = 1,
                        reportId = "FAKE_REPORT_ID_1",
                        referencedReportId = null,
                        analyzedByRules = emptyList(),
                        integrationDateTime = ZonedDateTime.now(),
                        isConsolidated = true,
                        isCorrected = false,
                        isDeleted = false,
                        isEnriched = true,
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
                    length = 10.0,
                    mmsi = null,
                    underCharter = null,
                    vesselName = null,
                ),
                vesselRiskFactor = null,
            ),
        )

        // When
        api.perform(get("/bff/v1/prior_notifications/FAKE_REPORT_ID_1"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo("FAKE_REPORT_ID_1")))
            .andExpect(jsonPath("$.isLessThanTwelveMetersVessel", equalTo(true)))
    }
}
