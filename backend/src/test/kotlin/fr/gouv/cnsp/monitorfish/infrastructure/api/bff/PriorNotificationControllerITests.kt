package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PdfDocument
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSource
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationComputeDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.PriorNotificationDataInput
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

    @MockBean
    private lateinit var verifyAndSendPriorNotification: VerifyAndSendPriorNotification

    @MockBean
    private lateinit var updatePriorNotificationNote: UpdatePriorNotificationNote

    @MockBean
    private lateinit var getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `getAll Should get a list of prior notifications`() {
        val firstFakePriorNotification = PriorNotificationFaker.fakePriorNotification(1)
        val secondFakePriorNotification = PriorNotificationFaker.fakePriorNotification(2)

        // Given
        given(getPriorNotifications.execute(any(), any(), any(), any(), any(), any())).willReturn(
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
            .andExpect(jsonPath("$.data[0].id", equalTo(firstFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.data[1].id", equalTo(secondFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.extraData.perSeafrontGroupCount", equalTo(emptyMap<Any, Any>())))
            .andExpect(jsonPath("$.lastPageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageSize", equalTo(10)))
            .andExpect(jsonPath("$.totalLength", equalTo(2)))
    }

    @Test
    fun `getManualComputation Should get a manual prior notification computed values`() {
        // Given
        given(this.computeManualPriorNotification.execute(any(), any(), any(), any(), any()))
            .willReturn(
                ManualPriorNotificationComputedValues(
                    isInVerificationScope = false,
                    isVesselUnderCharter = null,
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselRiskFactor = 1.2,
                ),
            )

        // When
        val requestBody = objectMapper.writeValueAsString(
            ManualPriorNotificationComputeDataInput(
                faoArea = "FAO AREA 51",
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
    fun `getOneManual Should get a manual prior notification form data by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(getPriorNotification.execute(fakePriorNotification.reportId!!, true))
            .willReturn(fakePriorNotification)

        // When
        api.perform(get("/bff/v1/prior_notifications/manual/${fakePriorNotification.reportId!!}"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `updateManual Should create a manual prior notification`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

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
            ManualPriorNotificationDataInput(
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                authorTrigram = "ABC",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.now(),
                expectedLandingDate = ZonedDateTime.now(),
                faoArea = "FAO AREA 51",
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

        // Given
        given(
            createOrUpdateManualPriorNotification.execute(
                hasPortEntranceAuthorization = anyOrNull(),
                hasPortLandingAuthorization = anyOrNull(),
                authorTrigram = anyOrNull(),
                didNotFishAfterZeroNotice = anyOrNull(),
                expectedArrivalDate = anyOrNull(),
                expectedLandingDate = anyOrNull(),
                faoArea = anyOrNull(),
                fishingCatches = anyOrNull(),
                note = anyOrNull(),
                portLocode = anyOrNull(),
                reportId = anyOrNull(),
                sentAt = anyOrNull(),
                purpose = anyOrNull(),
                tripGearCodes = anyOrNull(),
                vesselId = anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(
            ManualPriorNotificationDataInput(
                hasPortEntranceAuthorization = true,
                hasPortLandingAuthorization = true,
                authorTrigram = "ABC",
                didNotFishAfterZeroNotice = false,
                expectedArrivalDate = ZonedDateTime.now(),
                expectedLandingDate = ZonedDateTime.now(),
                faoArea = "FAO AREA 51",
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
        given(getPriorNotification.execute(fakePriorNotification.reportId!!, false))
            .willReturn(fakePriorNotification)

        // When
        api.perform(get("/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}?isManuallyCreated=false"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `verify_and_send Should verify and send a prior notification by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()

        // Given
        given(verifyAndSendPriorNotification.execute(fakePriorNotification.reportId!!, false))
            .willReturn(fakePriorNotification)

        // When
        api.perform(
            post(
                "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/verify_and_send?isManuallyCreated=false",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `update Should update a prior notification note by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageTyped.typedMessage.note = "Test !"

        // Given
        given(
            updatePriorNotificationNote.execute(
                note = anyOrNull(),
                reportId = anyOrNull(),
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(
            PriorNotificationDataInput(
                note = "Test !",
            ),
        )
        api.perform(
            put("/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/note")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
            .andExpect(
                jsonPath(
                    "$.logbookMessage.message.note",
                    equalTo(fakePriorNotification.logbookMessageTyped.typedMessage.note),
                ),
            )
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
        given(getPriorNotificationPdfDocument.execute("REPORT_ID"))
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
}
