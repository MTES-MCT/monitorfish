package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import fr.gouv.cnsp.monitorfish.domain.use_cases.healthcheck.GetHealthcheck
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

@Import(SecurityConfig::class, OIDCProperties::class)
@WebMvcTest(value = [(HealthcheckController::class)])
class HealthcheckControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getHealthcheck: GetHealthcheck

    @Test
    fun `Should get the health check`() {
        // Given
        given(this.getHealthcheck.execute()).willReturn(
            Health(
                ZonedDateTime.parse("2020-12-21T15:01:00Z"),
                ZonedDateTime.parse("2020-12-21T16:01:00Z"),
                ZonedDateTime.parse("2020-12-21T17:01:00Z"),
            ),
        )

        // When
        api.perform(get("/api/v1/healthcheck"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.dateLastPositionUpdatedByPrefect", equalTo("2020-12-21T15:01:00Z")))
            .andExpect(jsonPath("$.dateLastPositionReceivedByAPI", equalTo("2020-12-21T16:01:00Z")))
            .andExpect(jsonPath("$.dateLogbookMessageReceived", equalTo("2020-12-21T17:01:00Z")))
    }
}
