package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.SpeciesAndSpeciesGroupsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialSnapshots
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.VersionedReferential
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

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(ReferentialController::class)])
class ReferentialControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var referentialSnapshots: ReferentialSnapshots

    @Test
    fun `Should get the version of each referential`() {
        // Given
        given(referentialSnapshots.gears()).willReturn(VersionedReferential(listOf(), "gears1"))
        given(referentialSnapshots.infractions()).willReturn(VersionedReferential(listOf(), "infractions1"))
        given(referentialSnapshots.ports()).willReturn(VersionedReferential(listOf(), "ports1"))
        given(referentialSnapshots.regulations()).willReturn(VersionedReferential("{}", "regulations1"))
        given(referentialSnapshots.species()).willReturn(
            VersionedReferential(
                SpeciesAndSpeciesGroupsDataOutput(
                    species = listOf(),
                    groups = listOf(),
                ),
                "species1",
            ),
        )

        // When
        api
            .perform(get("/bff/v1/referentials/versions"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.gears", equalTo("gears1")))
            .andExpect(jsonPath("$.infractions", equalTo("infractions1")))
            .andExpect(jsonPath("$.ports", equalTo("ports1")))
            .andExpect(jsonPath("$.regulations", equalTo("regulations1")))
            .andExpect(jsonPath("$.species", equalTo("species1")))
    }
}
