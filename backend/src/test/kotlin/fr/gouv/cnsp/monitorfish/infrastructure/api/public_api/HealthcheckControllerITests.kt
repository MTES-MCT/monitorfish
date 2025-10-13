package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import fr.gouv.cnsp.monitorfish.domain.use_cases.healthcheck.GetHealthcheck
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(HealthcheckController::class)])
class HealthcheckControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getHealthcheck: GetHealthcheck

    @Test
    fun `Should get the health check`() {
        // Given
        given(this.getHealthcheck.execute()).willReturn(
            Health(
                dateLastPositionUpdatedByPrefect = ZonedDateTime.parse("2020-12-21T15:01:00Z"),
                dateLastPositionReceivedByAPI = ZonedDateTime.parse("2020-12-21T16:01:00Z"),
                dateLogbookMessageReceived = ZonedDateTime.parse("2020-12-21T17:01:00.000Z"),
                suddenDropOfPositionsReceived = false,
            ),
        )

        // When
        api
            .perform(get("/api/v1/healthcheck"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dateLastPositionUpdatedByPrefect", equalTo("2020-12-21T15:01:00Z")))
            .andExpect(jsonPath("$.dateLastPositionReceivedByAPI", equalTo("2020-12-21T16:01:00Z")))
            .andExpect(jsonPath("$.dateLogbookMessageReceived", equalTo("2020-12-21T17:01:00Z")))
            .andExpect(jsonPath("$.suddenDropOfPositionsReceived", equalTo(false)))
    }
}
