package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.use_cases.district.GetAllDistricts
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(DistrictController::class)])
class DistrictControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllDistricts: GetAllDistricts

    @Test
    fun `Should get all districts`() {
        // Given
        given(this.getAllDistricts.execute()).willReturn(
            listOf(
                District("LO", "Lorient", "56", "Morbihan", "DML 56", "NAMO"),
                District("BS", "Brest", "29", "Finistère", "DML 29", "NAMO"),
            ),
        )

        // When
        api
            .perform(get("/bff/v1/districts"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].label", equalTo("Finistère")))
            .andExpect(jsonPath("$[0].children[0].label", equalTo("Brest")))
            .andExpect(jsonPath("$[0].children[0].value", equalTo("BS")))
            .andExpect(jsonPath("$[1].label", equalTo("Morbihan")))
            .andExpect(jsonPath("$[1].children[0].label", equalTo("Lorient")))
            .andExpect(jsonPath("$[1].children[0].value", equalTo("LO")))
    }
}
