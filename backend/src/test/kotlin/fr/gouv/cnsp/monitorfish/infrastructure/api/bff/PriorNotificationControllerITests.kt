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
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
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
    private lateinit var computeManualPriorNotification: ComputeManualPriorNotification

    @MockBean
    private lateinit var createOrUpdateManualPriorNotification: CreateOrUpdateManualPriorNotification

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var getPriorNotifications: GetPriorNotifications

    @MockBean
    private lateinit var getPriorNotificationTypes: GetPriorNotificationTypes

    @Test
    fun `Should get a list of prior notifications`() {
        // Given
        given(this.getPriorNotifications.execute(any(), any(), any(), any(), any(), any())).willReturn(
            PaginatedList(
                data = listOf(
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
                        port = null,
                        reportingCount = null,
                        seafront = null,
                        sentAt = null,
                        state = null,
                        updatedAt = null,
                        vessel = Vessel(
                            id = 1,
                            flagState = CountryCode.FR,
                            hasLogbookEsacapt = false,
                            internalReferenceNumber = "FAKE_CFR_1",
                            vesselName = "FAKE_VESSEL_NAME",
                        ),
                        vesselRiskFactor = null,
                    ),

                    PriorNotification(
                        reportId = "FAKE_REPORT_ID_2_COR",
                        authorTrigram = null,
                        createdAt = null,
                        didNotFishAfterZeroNotice = false,
                        isManuallyCreated = false,
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
                                reportDateTime = ZonedDateTime.now(),
                                transmissionFormat = LogbookTransmissionFormat.ERS,
                            ),
                        ),
                        port = null,
                        reportingCount = 0,
                        seafront = null,
                        sentAt = null,
                        state = null,
                        updatedAt = null,
                        vessel = Vessel(
                            id = 2,
                            flagState = CountryCode.FR,
                            hasLogbookEsacapt = false,
                            internalReferenceNumber = "FAKE_CFR_2",
                            vesselName = "FAKE_VESSEL_NAME",
                        ),
                        vesselRiskFactor = null,
                    ),
                ),
                extraData = PriorNotificationStats(perSeafrontGroupCount = emptyMap()),
                lastPageNumber = 0,
                pageNumber = 0,
                pageSize = 10,
                totalLength = 2,
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
            .andExpect(jsonPath("$.extraData.perSeafrontGroupCount", equalTo(emptyMap<Any, Any>())))
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
                        isEnriched = true,
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
                state = null,
                updatedAt = null,
                vessel = Vessel(
                    id = 1,
                    flagState = CountryCode.FR,
                    hasLogbookEsacapt = false,
                    internalReferenceNumber = "FAKE_CFR_1",
                    length = 10.0,
                    mmsi = null,
                    underCharter = null,
                    vesselName = "FAKE_VESSEL_NAME",
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
