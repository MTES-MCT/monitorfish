package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFaoAreas
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(MapperConfiguration::class, SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [PublicFaoAreaController::class])
class PublicFaoAreaControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getFaoAreas: GetFaoAreas

    @Test
    fun `Should get all FAO areas`() {
        // Given
        given(this.getFaoAreas.execute()).willReturn(listOf("27.7.b", "27.8.a"))

        // When
        api
            .perform(get("/api/v1/fao_areas"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0]", equalTo("27.7.b")))
            .andExpect(jsonPath("$[1]", equalTo("27.8.a")))
    }
}
