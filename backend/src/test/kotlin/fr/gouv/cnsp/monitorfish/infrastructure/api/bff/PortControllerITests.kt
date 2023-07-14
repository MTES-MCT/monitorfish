package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
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

@Import(SecurityConfig::class, OIDCProperties::class, SentryConfig::class)
@WebMvcTest(value = [(PortController::class)])
class PortControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getActivePorts: GetActivePorts

    @Test
    fun `Should get all active ports`() {
        // Given
        given(this.getActivePorts.execute()).willReturn(
            listOf(
                Port("ET", "Etel", latitude = 47.123, longitude = 0.123),
                Port("AY", "Auray"),
            ),
        )

        // When
        api.perform(get("/bff/v1/ports"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].locode", equalTo("ET")))
            .andExpect(jsonPath("$[0].name", equalTo("Etel")))
            .andExpect(jsonPath("$[0].latitude", equalTo(47.123)))
            .andExpect(jsonPath("$[0].longitude", equalTo(0.123)))
    }
}
