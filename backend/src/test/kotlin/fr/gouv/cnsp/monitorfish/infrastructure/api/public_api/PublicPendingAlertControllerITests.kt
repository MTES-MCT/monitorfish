package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.ValidatePendingAlert
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PublicOperationalAlertController::class)])
class PublicPendingAlertControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var validatePendingAlert: ValidatePendingAlert

    @Test
    fun `Should validate an operational alert`() {
        // When
        api.perform(MockMvcRequestBuilders.put("/api/v1/operational_alerts/666/validate"))
            // Then
            .andExpect(MockMvcResultMatchers.status().isOk)
    }
}
