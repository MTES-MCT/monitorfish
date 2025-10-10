package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber
import fr.gouv.cnsp.monitorfish.fakers.FullControlUnitFaker
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.PriorNotificationSubscriberDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PriorNotificationSubscriberController::class)])
class PriorNotificationSubscriberControllerUTests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var getPriorNotificationSubscriber: GetPriorNotificationSubscriber

    @MockitoBean
    private lateinit var getPriorNotificationSubscribers: GetPriorNotificationSubscribers

    @MockitoBean
    private lateinit var updatePriorNotificationSubscriber: UpdatePriorNotificationSubscriber

    @Test
    fun `getAll Should get a list of prior notification subscribers`() {
        // Given
        val fakeControlUnit1 = FullControlUnitFaker.fakeFullControlUnit(id = 100, name = "Control Unit 1")
        val fakeControlUnit2 = FullControlUnitFaker.fakeFullControlUnit(id = 101, name = "Control Unit 2")

        val fakeSubscriber1 =
            PriorNotificationSubscriber(
                controlUnit = fakeControlUnit1,
                fleetSegmentSubscriptions = emptyList(),
                portSubscriptions = emptyList(),
                vesselSubscriptions = emptyList(),
            )
        val fakeSubscriber2 =
            PriorNotificationSubscriber(
                controlUnit = fakeControlUnit2,
                fleetSegmentSubscriptions = emptyList(),
                portSubscriptions = emptyList(),
                vesselSubscriptions = emptyList(),
            )

        given(
            getPriorNotificationSubscribers.execute(
                any(),
                any(),
                any(),
            ),
        ).willReturn(
            listOf(fakeSubscriber1, fakeSubscriber2),
        )

        // When
        api
            .perform(
                get("/bff/v1/prior_notification_subscribers?sortColumn=CONTROL_UNIT_NAME&sortDirection=ASC"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].controlUnit.id", equalTo(fakeSubscriber1.controlUnit.id)))
            .andExpect(jsonPath("$[1].controlUnit.id", equalTo(fakeSubscriber2.controlUnit.id)))
    }

    @Test
    fun `getOne Should get a prior notification subscriber by its controlUnitId`() {
        // Given
        val fakeControlUnitId = 100
        val fakeControlUnit = FullControlUnitFaker.fakeFullControlUnit(id = fakeControlUnitId, name = "Control Unit 1")

        val fakeSubscriber =
            PriorNotificationSubscriber(
                controlUnit = fakeControlUnit,
                fleetSegmentSubscriptions = emptyList(),
                portSubscriptions = emptyList(),
                vesselSubscriptions = emptyList(),
            )

        given(
            getPriorNotificationSubscriber.execute(fakeControlUnitId),
        ).willReturn(fakeSubscriber)

        // When
        api
            .perform(
                get("/bff/v1/prior_notification_subscribers/$fakeControlUnitId"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.controlUnit.id", equalTo(fakeControlUnitId)))
    }

    @Test
    fun `updateOne Should update a prior notification subscriber by its controlUnitId`() {
        // Given
        val fakeControlUnitId = 100
        val fakeControlUnit = FullControlUnitFaker.fakeFullControlUnit(id = fakeControlUnitId, name = "Control Unit 1")

        val fakeSubscriber =
            PriorNotificationSubscriber(
                controlUnit = fakeControlUnit,
                fleetSegmentSubscriptions = emptyList(),
                portSubscriptions = emptyList(),
                vesselSubscriptions = emptyList(),
            )

        val fakeDataInput =
            PriorNotificationSubscriberDataInput(
                controlUnitId = fakeControlUnitId,
                portLocodes = listOf("FRABC", "ESXYZ"),
                portLocodesWithFullSubscription = listOf("ESXYZ"),
                fleetSegmentCodes = listOf("SEG001", "SEG002"),
                vesselIds = listOf(1001, 1002),
            )

        given(
            updatePriorNotificationSubscriber.execute(
                controlUnitId = any(),
                fleetSegmentSubscriptions = any(),
                portSubscriptions = any(),
                vesselSubscriptions = any(),
            ),
        ).willReturn(fakeSubscriber)

        val requestBody = objectMapper.writeValueAsString(fakeDataInput)

        // When
        api
            .perform(
                put("/bff/v1/prior_notification_subscribers/$fakeControlUnitId")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.controlUnit.id", equalTo(fakeControlUnitId)))
    }
}
