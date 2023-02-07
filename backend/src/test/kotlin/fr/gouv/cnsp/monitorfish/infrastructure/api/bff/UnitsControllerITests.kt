package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Controller
import fr.gouv.cnsp.monitorfish.domain.use_cases.controller.GetAllControllers
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

@Import(WebSecurityConfig::class)
@WebMvcTest(value = [(UnitsController::class)])
class UnitsControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getAllControllers: GetAllControllers

    @Test
    fun `Should return all controllers`() {
        // Given
        given(getAllControllers.execute()).willReturn(
            listOf(
                Controller(1, "ULAM 56", "Terrestre", "Affaires Maritimes"),
            ),
        )

        // When
        mockMvc.perform(get("/bff/v1/controllers"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].controller", equalTo("ULAM 56")))
            .andExpect(jsonPath("$[0].controllerType", equalTo("Terrestre")))
            .andExpect(jsonPath("$[0].administration", equalTo("Affaires Maritimes")))
    }
}
