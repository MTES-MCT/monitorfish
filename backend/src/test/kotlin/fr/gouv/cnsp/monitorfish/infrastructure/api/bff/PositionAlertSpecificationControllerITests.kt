package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class, MapperConfiguration::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(PositionAlertSpecificationController::class)])
class PositionAlertSpecificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getPositionAlertSpecifications: GetPositionAlertSpecifications

    @MockBean
    private lateinit var activateOrDeactivateAlertSpecification: ActivateOrDeactivateAlertSpecification

    @MockBean
    private lateinit var deleteAlertSpecification: DeleteAlertSpecification

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all position alerts`() {
        // Given
        given(getPositionAlertSpecifications.execute()).willReturn(
            listOf(DUMMY_POSITION_ALERT),
        )

        // When
        api
            .perform(get("/bff/v1/position_alerts_specs"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].name", equalTo("Chalutage dans les 3 milles")))
            .andExpect(jsonPath("$[0].type", equalTo("POSITION_ALERT")))
    }

    @Test
    fun `Should activate an alert specification`() {
        // When
        api
            .perform(put("/bff/v1/position_alerts_specs/123/activate"))
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(activateOrDeactivateAlertSpecification).execute(123, true)
    }

    @Test
    fun `Should deactivate an alert specification`() {
        // When
        api
            .perform(put("/bff/v1/position_alerts_specs/456/deactivate"))
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(activateOrDeactivateAlertSpecification).execute(456, false)
    }

    @Test
    fun `Should delete an alert specification`() {
        // When
        api
            .perform(delete("/bff/v1/position_alerts_specs/789"))
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(deleteAlertSpecification).execute(789)
    }
}
