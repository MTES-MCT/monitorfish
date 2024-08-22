package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.LogbookPriorNotificationFormDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationComputeDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationFormDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PriorNotificationController::class)])
class PriorNotificationControllerUTests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var computeManualPriorNotification: ComputeManualPriorNotification

    @MockBean
    private lateinit var createOrUpdateManualPriorNotification: CreateOrUpdateManualPriorNotification

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument

    @MockBean
    private lateinit var getPriorNotifications: GetPriorNotifications

    @MockBean
    private lateinit var getNumberToVerify: GetNumberToVerify

    @MockBean
    private lateinit var getPriorNotificationTypes: GetPriorNotificationTypes

    @MockBean
    private lateinit var verifyAndSendPriorNotification: VerifyAndSendPriorNotification

    @MockBean
    private lateinit var updateLogbookPriorNotification: UpdateLogbookPriorNotification

    @MockBean
    private lateinit var invalidatePriorNotification: InvalidatePriorNotification

    @Test
    fun `getAll Should get a list of prior notifications`() {
        val firstFakePriorNotification = PriorNotificationFaker.fakePriorNotification(1)
        val secondFakePriorNotification = PriorNotificationFaker.fakePriorNotification(2)

        // Given
        given(getPriorNotifications.execute(any(), any(), anyOrNull(), any(), any(), any(), any())).willReturn(
            PaginatedList(
                data = listOf(firstFakePriorNotification, secondFakePriorNotification),
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
            .andExpect(jsonPath("$.data[0].reportId", equalTo(firstFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.data[1].reportId", equalTo(secondFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.extraData.perSeafrontGroupCount", equalTo(emptyMap<Any, Any>())))
            .andExpect(jsonPath("$.lastPageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageSize", equalTo(10)))
            .andExpect(jsonPath("$.totalLength", equalTo(2)))
    }

    @Test
    fun `updateLogbook Should update a logbook prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageAndValue.value.note = "Test !"

        // Given
        given(
            updateLogbookPriorNotification.execute(
                reportId = anyOrNull(),
                operationDate = anyOrNull(),
                authorTrigram = anyOrNull(),
                note = anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(
            LogbookPriorNotificationFormDataInput(
                authorTrigram = "ABC",
                note = "Test !",
            ),
        )
        val pnoValue = fakePriorNotification.logbookMessageAndValue.value
        api.perform(
            put(
                "/bff/v1/prior_notifications/logbook/${fakePriorNotification.reportId!!}?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}",
            )
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
            .andExpect(jsonPath("$.authorTrigram", equalTo(pnoValue.authorTrigram)))
            .andExpect(jsonPath("$.note", equalTo(pnoValue.note)))
    }

    @Test
    fun `getManualComputation Should get a manual prior notification computed values`() {
        // Given
        given(this.computeManualPriorNotification.execute(any(), any(), any(), any(), any()))
            .willReturn(
                ManualPriorNotificationComputedValues(
                    isVesselUnderCharter = null,
                    nextState = PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselRiskFactor = 1.2,
                ),
            )

        // When
        val requestBody = objectMapper.writeValueAsString(
            ManualPriorNotificationComputeDataInput(
                globalFaoArea = "FAO AREA 51",
                fishingCatches = emptyList(),
                portLocode = "FRABC",
                tripGearCodes = emptyList(),
                vesselId = 42,
            ),
        )
        api.perform(
            post("/bff/v1/prior_notifications/manual/compute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.riskFactor", equalTo(1.2)))
    }

    @Test
    fun `createManual Should create a manual prior notification`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageAndValue.value.authorTrigram = "ABC"

        // Given
        given(
            createOrUpdateManualPriorNotification.execute(
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
                anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(
            ManualPriorNotificationFormDataInput(
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                authorTrigram = "ABC",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.now(),
                expectedLandingDate = ZonedDateTime.now(),
                globalFaoArea = "FAO AREA 51",
                fishingCatches = emptyList(),
                note = null,
                portLocode = "FRABVC",
                sentAt = ZonedDateTime.now(),
                purpose = LogbookMessagePurpose.LAN,
                tripGearCodes = emptyList(),
                vesselId = 42,
            ),
        )
        api.perform(
            post("/bff/v1/prior_notifications/manual")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `updateManual Should update a manual prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageAndValue.value.authorTrigram = "ABC"

        // Given
        given(
            createOrUpdateManualPriorNotification.execute(
                reportId = any(),
                authorTrigram = anyOrNull(),
                didNotFishAfterZeroNotice = anyOrNull(),
                expectedArrivalDate = anyOrNull(),
                expectedLandingDate = anyOrNull(),
                globalFaoArea = anyOrNull(),
                fishingCatches = anyOrNull(),
                hasPortEntranceAuthorization = anyOrNull(),
                hasPortLandingAuthorization = anyOrNull(),
                note = anyOrNull(),
                portLocode = anyOrNull(),
                sentAt = anyOrNull(),
                purpose = anyOrNull(),
                tripGearCodes = anyOrNull(),
                vesselId = anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(
            ManualPriorNotificationFormDataInput(
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                authorTrigram = "ABC",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.now(),
                expectedLandingDate = ZonedDateTime.now(),
                globalFaoArea = "FAO AREA 51",
                fishingCatches = emptyList(),
                note = null,
                portLocode = "FRABVC",
                sentAt = ZonedDateTime.now(),
                purpose = LogbookMessagePurpose.LAN,
                tripGearCodes = emptyList(),
                vesselId = 42,
            ),
        )
        api.perform(
            put("/bff/v1/prior_notifications/manual/${fakePriorNotification.reportId!!}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `getNumberToVerify Should get the number of prior notification to verify`() {
        // Given
        given(getNumberToVerify.execute()).willReturn(
            PriorNotificationStats(perSeafrontGroupCount = mapOf(Pair(SeafrontGroup.ALL, 2))),
        )

        // When
        api.perform(
            get(
                "/bff/v1/prior_notifications/to_verify",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.perSeafrontGroupCount['ALL']", equalTo(2)))
    }

    @Test
    fun `getAllTypes Should get a list of prior notification types`() {
        // Given
        given(getPriorNotificationTypes.execute()).willReturn(listOf("Préavis de Type A", "Préavis de Type B"))

        // When
        api.perform(get("/bff/v1/prior_notifications/types"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0]", equalTo("Préavis de Type A")))
            .andExpect(jsonPath("$[1]", equalTo("Préavis de Type B")))
    }

    @Test
    fun `getOne Should get a prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(
            getPriorNotification.execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        api.perform(
            get(
                "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `getPdf Should get the PDF of a prior notification`() {
        val dummyPdfContent = """
            %PDF-1.4
            1 0 obj
            << /Type /Catalog /Pages 2 0 R >>
            endobj
            2 0 obj
            << /Type /Pages /Kids [3 0 R] /Count 1 >>
            endobj
            3 0 obj
            << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
            endobj
            4 0 obj
            << /Length 55 >>
            stream
            BT
            /F1 24 Tf
            100 700 Td
            (Hello, World!) Tj
            ET
            endstream
            endobj
            xref
            0 5
            0000000000 65535 f
            0000000010 00000 n
            0000000062 00000 n
            0000000113 00000 n
            0000000218 00000 n
            trailer
            << /Size 5 /Root 1 0 R >>
            startxref
            291
            %%EOF
        """.trimIndent().toByteArray()

        // Given
        given(getPriorNotificationPdfDocument.execute("REPORT_ID", false))
            .willReturn(
                PdfDocument(
                    reportId = "REPORT_ID",
                    source = PriorNotificationSource.LOGBOOK,
                    generationDatetimeUtc = ZonedDateTime.now(),
                    pdfDocument = dummyPdfContent,
                ),
            )

        // When
        api.perform(get("/bff/v1/prior_notifications/REPORT_ID/pdf"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(content().bytes(dummyPdfContent))
    }

    @Test
    fun `getPdfExistence Should get the PDF existence of a prior notification`() {
        // Given
        given(getPriorNotificationPdfDocument.execute("REPORT_ID", true)).willReturn(null)

        // When
        api.perform(get("/bff/v1/prior_notifications/REPORT_ID/pdf/exist"))
            // Then
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status", equalTo("NO_CONTENT")))
    }

    @Test
    fun `verify_and_send Should verify and send a prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(
            verifyAndSendPriorNotification.execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        api.perform(
            post(
                "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/verify_and_send?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `invalidate Should invalidate a prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageAndValue.value.isInvalidated = null

        // Given
        given(
            invalidatePriorNotification.execute(
                reportId = anyOrNull(),
                operationDate = anyOrNull(),
                isManuallyCreated = anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        api.perform(
            put(
                "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/invalidate?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
            .andExpect(
                jsonPath(
                    "$.logbookMessage.message.isInvalidated",
                    equalTo(fakePriorNotification.logbookMessageAndValue.value.isInvalidated),
                ),
            )
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }
}
