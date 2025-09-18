package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import fr.gouv.cnsp.monitorfish.fakers.LogbookMessageFaker
import fr.gouv.cnsp.monitorfish.fakers.PriorNotificationFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.LogbookPriorNotificationFormDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationComputeDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ManualPriorNotificationFormDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.ZonedDateTime
import kotlin.text.Charsets.UTF_8

@Import(SentryConfig::class)
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
    private lateinit var createPriorNotificationUpload: CreatePriorNotificationUpload

    @MockBean
    private lateinit var deletePriorNotificationUpload: DeletePriorNotificationUpload

    @MockBean
    private lateinit var getPriorNotification: GetPriorNotification

    @MockBean
    private lateinit var getPriorNotificationPdfDocument: GetPriorNotificationPdfDocument

    @MockBean
    private lateinit var getPriorNotificationSentMessages: GetPriorNotificationSentMessages

    @MockBean
    private lateinit var getPriorNotificationUpload: GetPriorNotificationUpload

    @MockBean
    private lateinit var getPriorNotificationUploads: GetPriorNotificationUploads

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

    private fun authenticatedRequest() =
        oidcLogin()
            .idToken { token ->
                token.claim("email", "email@domain-name.com")
            }

    @Test
    fun `getAll Should get a list of prior notifications`() {
        val firstFakePriorNotification = PriorNotificationFaker.fakePriorNotification(1)
        val secondFakePriorNotification = PriorNotificationFaker.fakePriorNotification(2)

        // Given
        given(
            getPriorNotifications.execute(
                any(),
                anyOrNull(),
                anyOrNull(),
                any(),
                anyOrNull(),
                any(),
                any(),
                any(),
                any(),
            ),
        ).willReturn(
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
        api
            .perform(
                get(
                    "/bff/v1/prior_notifications?willArriveAfter=2000-01-01T00:00:00Z&willArriveBefore=2100-01-01T00:00:00Z&seafrontGroup=ALL&sortColumn=EXPECTED_ARRIVAL_DATE&sortDirection=DESC&pageNumber=0&pageSize=10",
                ).with(authenticatedRequest()),
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
                note = anyOrNull(),
                updatedBy = anyOrNull(),
            ),
        ).willReturn(fakePriorNotification)

        // When
        val requestBody = objectMapper.writeValueAsString(LogbookPriorNotificationFormDataInput(note = "Test !"))
        val pnoValue = fakePriorNotification.logbookMessageAndValue.value
        api
            .perform(
                put(
                    "/bff/v1/prior_notifications/logbook/${fakePriorNotification.reportId!!}?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}",
                ).with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody)
                    .characterEncoding(UTF_8),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.note", equalTo(pnoValue.note)))
    }

    @Test
    fun `getManualComputation Should get a manual prior notification computed values`() {
        // Given
        given(this.computeManualPriorNotification.execute(any(), any(), any(), any(), any(), any()))
            .willReturn(
                ManualPriorNotificationComputedValues(
                    isVesselUnderCharter = null,
                    nextState = PriorNotificationState.OUT_OF_VERIFICATION_SCOPE,
                    tripSegments = emptyList(),
                    types = emptyList(),
                    vesselRiskFactor = 1.2,
                    isInVerificationScope = false,
                ),
            )

        // When
        val requestBody =
            objectMapper.writeValueAsString(
                ManualPriorNotificationComputeDataInput(
                    globalFaoArea = "FAO AREA 51",
                    fishingCatches = emptyList(),
                    portLocode = "FRABC",
                    tripGearCodes = emptyList(),
                    vesselId = 42,
                    year = 2025,
                ),
            )
        api
            .perform(
                post("/bff/v1/prior_notifications/manual/compute")
                    .with(authenticatedRequest())
                    .with(csrf())
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
        ).willReturn(fakePriorNotification)

        // When
        val requestBody =
            objectMapper.writeValueAsString(
                ManualPriorNotificationFormDataInput(
                    didNotFishAfterZeroNotice = false,
                    expectedArrivalDate = ZonedDateTime.now(),
                    expectedLandingDate = ZonedDateTime.now(),
                    fishingCatches = emptyList(),
                    globalFaoArea = "FAO AREA 51",
                    hasPortEntranceAuthorization = true,
                    hasPortLandingAuthorization = true,
                    note = null,
                    portLocode = "FRABVC",
                    sentAt = ZonedDateTime.now(),
                    purpose = LogbookMessagePurpose.LAN,
                    tripGearCodes = emptyList(),
                    vesselId = 42,
                ),
            )
        api
            .perform(
                post("/bff/v1/prior_notifications/manual")
                    .with(authenticatedRequest())
                    .with(csrf())
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
                author = anyOrNull(),
                didNotFishAfterZeroNotice = anyOrNull(),
                expectedArrivalDate = anyOrNull(),
                expectedLandingDate = anyOrNull(),
                fishingCatches = anyOrNull(),
                globalFaoArea = anyOrNull(),
                hasPortEntranceAuthorization = anyOrNull(),
                hasPortLandingAuthorization = anyOrNull(),
                note = anyOrNull(),
                portLocode = anyOrNull(),
                sentAt = anyOrNull(),
                purpose = anyOrNull(),
                tripGearCodes = anyOrNull(),
                vesselId = anyOrNull(),
            ),
        ).willReturn(fakePriorNotification)

        // When
        val requestBody =
            objectMapper.writeValueAsString(
                ManualPriorNotificationFormDataInput(
                    didNotFishAfterZeroNotice = false,
                    expectedArrivalDate = ZonedDateTime.now(),
                    expectedLandingDate = ZonedDateTime.now(),
                    fishingCatches = emptyList(),
                    globalFaoArea = "FAO AREA 51",
                    hasPortEntranceAuthorization = true,
                    hasPortLandingAuthorization = true,
                    note = null,
                    portLocode = "FRABVC",
                    sentAt = ZonedDateTime.now(),
                    purpose = LogbookMessagePurpose.LAN,
                    tripGearCodes = emptyList(),
                    vesselId = 42,
                ),
            )
        api
            .perform(
                put("/bff/v1/prior_notifications/manual/${fakePriorNotification.reportId!!}")
                    .with(authenticatedRequest())
                    .with(csrf())
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
        api
            .perform(
                get(
                    "/bff/v1/prior_notifications/to_verify",
                ).with(authenticatedRequest()),
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
        api
            .perform(get("/bff/v1/prior_notifications/types").with(authenticatedRequest()))
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
        ).willReturn(fakePriorNotification)

        // When
        api
            .perform(
                get(
                    "/bff/v1/prior_notifications/${fakePriorNotification.reportId}?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
                ).with(authenticatedRequest()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    // Non-regression test
    @Test
    fun `getOne Should get a logbook prior notification including a null weight in its fishing catches`() {
        val fakePriorNotification =
            PriorNotificationFaker.fakePriorNotification().copy(
                logbookMessageAndValue =
                    LogbookMessageAndValue(
                        logbookMessage =
                            LogbookMessageFaker.fakePnoLogbookMessage(
                                reportId = "FAKE_OPERATION_001",
                                message =
                                    LogbookMessageFaker.fakePnoMessage().apply {
                                        catchOnboard =
                                            listOf(
                                                LogbookMessageFaker.fakeLogbookFishingCatch(
                                                    species = "COD",
                                                    weight = 12.0,
                                                ),
                                                LogbookMessageFaker.fakeLogbookFishingCatch(
                                                    species = "HKE",
                                                    weight = null,
                                                ),
                                            )
                                        catchToLand =
                                            listOf(
                                                LogbookMessageFaker.fakeLogbookFishingCatch(
                                                    species = "COD",
                                                    weight = 12.0,
                                                ),
                                                LogbookMessageFaker.fakeLogbookFishingCatch(
                                                    species = "HKE",
                                                    weight = null,
                                                ),
                                            )
                                    },
                            ),
                        clazz = PNO::class.java,
                    ),
            )

        // Given
        given(
            getPriorNotification.execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                false,
            ),
        ).willReturn(fakePriorNotification)

        // When
        api
            .perform(
                get(
                    "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
                ).with(authenticatedRequest()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId!!)))
            .andExpect(jsonPath("$.asManualDraft.fishingCatches[0].weight", equalTo(12.0)))
            .andExpect(jsonPath("$.asManualDraft.fishingCatches[1].weight", equalTo(0.0)))
            .andExpect(jsonPath("$.logbookMessage.message.catchOnboard[0].weight", equalTo(12.0)))
            .andExpect(jsonPath("$.logbookMessage.message.catchToLand[1].weight", equalTo(null)))
    }

    @Test
    fun `getPdf Should get the PDF of a prior notification`() {
        val dummyPdfContent =
            """
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
        api
            .perform(get("/bff/v1/prior_notifications/REPORT_ID/pdf").with(authenticatedRequest()))
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
        api
            .perform(get("/bff/v1/prior_notifications/REPORT_ID/pdf/exist").with(authenticatedRequest()))
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
        ).willReturn(fakePriorNotification)

        // When
        api
            .perform(
                post(
                    "/bff/v1/prior_notifications/${fakePriorNotification.reportId}/verify_and_send?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
                ).with(authenticatedRequest()).with(csrf()),
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
        ).willReturn(fakePriorNotification)

        // When
        api
            .perform(
                put(
                    "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/invalidate?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}&isManuallyCreated=false",
                ).with(authenticatedRequest()).with(csrf()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
            .andExpect(
                jsonPath(
                    "$.logbookMessage.message.isInvalidated",
                    equalTo(fakePriorNotification.logbookMessageAndValue.value.isInvalidated),
                ),
            ).andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `getSentMessages Should get a list of prior notification sent messages`() {
        val fakeReportId = "FAKE_REPORT_ID"

        // Given
        given(getPriorNotificationSentMessages.execute(fakeReportId)).willReturn(
            listOf(
                PriorNotificationSentMessage(
                    id = 1,
                    communicationMeans = "EMAIL",
                    dateTimeUtc = ZonedDateTime.now(),
                    errorMessage = null,
                    priorNotificationReportId = fakeReportId,
                    priorNotificationSource = "LOGBOOK",
                    recipientAddressOrNumber = "dreal01@example.org",
                    recipientName = "DREAL 01",
                    recipientOrganization = "DREAL",
                    success = true,
                ),
                PriorNotificationSentMessage(
                    id = 2,
                    communicationMeans = "SMS",
                    dateTimeUtc = ZonedDateTime.now(),
                    errorMessage = null,
                    priorNotificationReportId = fakeReportId,
                    priorNotificationSource = "MANUAL",
                    recipientAddressOrNumber = "+33123456789",
                    recipientName = "DREAL 02",
                    recipientOrganization = "DREAL",
                    success = true,
                ),
            ),
        )

        // When
        api
            .perform(get("/bff/v1/prior_notifications/$fakeReportId/sent_messages").with(authenticatedRequest()))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].communicationMeans", equalTo("EMAIL")))
            .andExpect(jsonPath("$[1].communicationMeans", equalTo("SMS")))
    }
}
