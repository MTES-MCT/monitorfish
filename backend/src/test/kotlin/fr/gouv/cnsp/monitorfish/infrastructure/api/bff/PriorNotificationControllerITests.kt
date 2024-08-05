package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.ManualPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
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
    private lateinit var getNumberToVerify: GetNumberToVerify

    @MockBean
    private lateinit var getPriorNotificationTypes: GetPriorNotificationTypes

    @MockBean
    private lateinit var verifyAndSendPriorNotification: VerifyAndSendPriorNotification

    @MockBean
    private lateinit var updateLogbookPriorNotification: UpdateLogbookPriorNotification

    @MockBean
    private lateinit var invalidatePriorNotification: InvalidatePriorNotification

    @Autowired
    private lateinit var objectMapper: ObjectMapper

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
            .andExpect(jsonPath("$.data[0].id", equalTo(firstFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.data[1].id", equalTo(secondFakePriorNotification.reportId)))
            .andExpect(jsonPath("$.extraData.perSeafrontGroupCount", equalTo(emptyMap<Any, Any>())))
            .andExpect(jsonPath("$.lastPageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageNumber", equalTo(0)))
            .andExpect(jsonPath("$.pageSize", equalTo(10)))
            .andExpect(jsonPath("$.totalLength", equalTo(2)))
    }

    @Test
    fun `getAutoData Should get an auto prior notification form data by its reportId`() {
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
                "/bff/v1/prior_notifications/logbook/${fakePriorNotification.reportId!!}/data?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `updateAuto Should update an auto prior notification by its reportId`() {
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
            .andExpect(
                jsonPath(
                    "$.note",
                    equalTo(fakePriorNotification.logbookMessageAndValue.value.note),
                ),
            )
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
    fun `getManualData Should get a manual prior notification form data by its reportId`() {
        val fakePriorNotification = PriorNotificationFaker.fakePriorNotification()
        fakePriorNotification.logbookMessageAndValue.value.authorTrigram = "ABC"

        // Given
        given(
            getPriorNotification.execute(
                fakePriorNotification.reportId!!,
                fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime,
                true,
            ),
        )
            .willReturn(fakePriorNotification)

        // When
        api.perform(
            get(
                "/bff/v1/prior_notifications/manual/${fakePriorNotification.reportId!!}/data?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `updateManual Should create a manual prior notification`() {
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
        fakePriorNotification.logbookMessageAndValue.value.authorTrigram = "ABC"

        // Given
        given(
            createOrUpdateManualPriorNotification.execute(
                reportId = any(),
                authorTrigram = anyOrNull(),
                didNotFishAfterZeroNotice = anyOrNull(),
                expectedArrivalDate = anyOrNull(),
                expectedLandingDate = anyOrNull(),
                faoArea = anyOrNull(),
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
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
    }

    @Test
    fun `update Should update a prior notification note by its reportId`() {
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
        api.perform(
            put(
                "/bff/v1/prior_notifications/${fakePriorNotification.reportId!!}/note?operationDate=${fakePriorNotification.logbookMessageAndValue.logbookMessage.operationDateTime}",
            )
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
            .andExpect(
                jsonPath(
                    "$.logbookMessage.message.note",
                    equalTo(fakePriorNotification.logbookMessageAndValue.value.note),
                ),
            )
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
            .andExpect(jsonPath("$.id", equalTo(fakePriorNotification.reportId)))
            .andExpect(
                jsonPath(
                    "$.logbookMessage.message.isInvalidated",
                    equalTo(fakePriorNotification.logbookMessageAndValue.value.isInvalidated),
                ),
            )
            .andExpect(jsonPath("$.reportId", equalTo(fakePriorNotification.reportId)))
    }
}
