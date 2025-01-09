package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.gear.GetAllGears
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetAllSpeciesAndSpeciesGroups
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
@WebMvcTest(value = [(DataReferentialController::class)])
class DataReferentialControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllGears: GetAllGears

    @MockBean
    private lateinit var getAllSpeciesAndSpeciesGroups: GetAllSpeciesAndSpeciesGroups

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all gears`() {
        // Given
        given(this.getAllGears.execute()).willReturn(listOf(Gear("CHL", "SUPER CHALUT", "CHALUT")))

        // When
        api.perform(get("/bff/v1/gears"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].code", equalTo("CHL")))
            .andExpect(jsonPath("$[0].name", equalTo("SUPER CHALUT")))
            .andExpect(jsonPath("$[0].category", equalTo("CHALUT")))
    }

    @Test
    fun `Should get all species`() {
        // Given
        given(this.getAllSpeciesAndSpeciesGroups.execute()).willReturn(
            SpeciesAndSpeciesGroups(
                species =
                    listOf(
                        Species(
                            code = "FAK",
                            name = "Facochère",
                            scipSpeciesType = ScipSpeciesType.PELAGIC,
                        ),
                    ),
                groups =
                    listOf(
                        SpeciesGroup(
                            group = "FAKOKO",
                            comment = "Facochère group",
                        ),
                    ),
            ),
        )

        // When
        api.perform(get("/bff/v1/species"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.species.length()", equalTo(1)))
            .andExpect(jsonPath("$.groups.length()", equalTo(1)))
    }
}
