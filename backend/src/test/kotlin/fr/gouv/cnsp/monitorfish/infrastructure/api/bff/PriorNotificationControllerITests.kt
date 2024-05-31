package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotification
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotificationTypes
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.GetPriorNotifications
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PriorNotificationController::class)])
class PriorNotificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var getPriorNotifications: GetPriorNotifications

    @MockBean
    private lateinit var getPriorNotificationTypes: GetPriorNotificationTypes

    @Test
    fun `Should get a list of prior notifications`() {
        // Given
        given(this.getPriorNotifications.execute(any(), any(), any())).willReturn(
            listOf(
                PriorNotification(
                    fingerprint = "1",
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
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    reportingCount = null,
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
                        hasLogbookEsacapt = false,
                    ),
                    vesselRiskFactor = null,
                ),

                PriorNotification(
                    fingerprint = "3",
                    logbookMessageTyped = LogbookMessageTyped(
                        clazz = PNO::class.java,
                        logbookMessage = LogbookMessage(
                            id = 3,
                            reportId = "FAKE_REPORT_ID_2_COR",
                            referencedReportId = "FAKE_NONEXISTENT_REPORT_ID_2",
                            analyzedByRules = emptyList(),
                            integrationDateTime = ZonedDateTime.now(),
                            isCorrectedByNewerMessage = true,
                            isDeleted = false,
                            isEnriched = false,
                            message = PNO(),
                            operationDateTime = ZonedDateTime.now(),
                            operationNumber = "1",
                            operationType = LogbookOperationType.COR,
                            transmissionFormat = LogbookTransmissionFormat.ERS,
                        ),
                    ),
                    reportingCount = null,
                    seafront = null,
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
                        hasLogbookEsacapt = false,
                    ),
                    vesselRiskFactor = null,
                ),
            ),
        )

        // When
        api.perform(
            get(
                "/bff/v1/prior_notifications?willArriveAfter=2000-01-01T00:00:00Z&willArriveBefore=2100-01-01T00:00:00Z&seafrontGroup=ALL&sortColumn=EXPECTED_ARRIVAL_DATE&sortDirection=DESC&pageNumber=0&pageSize=10",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()", equalTo(2)))
            .andExpect(jsonPath("$.data[0].id", equalTo("FAKE_REPORT_ID_1")))
            .andExpect(jsonPath("$.data[1].id", equalTo("FAKE_NONEXISTENT_REPORT_ID_2")))
            .andExpect(jsonPath("$.lastPageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageSize", equalTo(10)))
            .andExpect(jsonPath("$.totalLength", equalTo(2)))
    }

    @Test
    fun `Should get a list of prior notification types`() {
        // Given
        given(this.getPriorNotificationTypes.execute()).willReturn(listOf("Préavis de Type A", "Préavis de Type B"))

        // When
        api.perform(get("/bff/v1/prior_notifications/types"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0]", equalTo("Préavis de Type A")))
            .andExpect(jsonPath("$[1]", equalTo("Préavis de Type B")))
    }

    @Test
    fun `Should get a prior notification by its (logbook report) ID`() {
        // Given
        given(this.getPriorNotification.execute("FAKE_REPORT_ID_1")).willReturn(
            PriorNotification(
                fingerprint = "1",
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
                        isEnriched = true,
                        message = PNO(),
                        operationDateTime = ZonedDateTime.now(),
                        operationNumber = "1",
                        operationType = LogbookOperationType.DAT,
                        transmissionFormat = LogbookTransmissionFormat.ERS,
                    ),
                ),
                reportingCount = null,
                seafront = null,
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
                    hasLogbookEsacapt = false,
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
