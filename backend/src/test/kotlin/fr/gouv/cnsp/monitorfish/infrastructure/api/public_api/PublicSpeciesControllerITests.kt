package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpecies
import fr.gouv.cnsp.monitorfish.fakers.SpeciesFaker
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.nullValue
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
@WebMvcTest(value = [PublicSpeciesController::class])
class PublicSpeciesControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllSpecies: GetAllSpecies

    @Test
    fun `Should get all species`() {
        // Given
        given(this.getAllSpecies.execute()).willReturn(
            listOf(
                SpeciesFaker.fakeSpecies(
                    code = "HKE",
                    name = "MERLU EUROPEEN",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesFaker.fakeSpecies(code = "SOL", name = "SOLE COMMUNE"),
            ),
        )

        // When
        api
            .perform(get("/api/v1/species"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].code", equalTo("HKE")))
            .andExpect(jsonPath("$[0].name", equalTo("MERLU EUROPEEN")))
            .andExpect(jsonPath("$[0].scipSpeciesType", equalTo("DEMERSAL")))
            .andExpect(jsonPath("$[1].code", equalTo("SOL")))
            .andExpect(jsonPath("$[1].scipSpeciesType", nullValue()))
    }
}
