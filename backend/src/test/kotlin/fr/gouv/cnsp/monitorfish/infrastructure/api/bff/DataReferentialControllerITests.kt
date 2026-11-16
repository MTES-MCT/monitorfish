package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesAndSpeciesGroups
import fr.gouv.cnsp.monitorfish.domain.entities.species.SpeciesGroup
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.GearDataOutput
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(DataReferentialController::class)])
class DataReferentialControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var referentialSnapshots: ReferentialSnapshots

    @Test
    fun `Should get all gears`() {
        // Given
        given(this.referentialSnapshots.gears()).willReturn(
            VersionedReferential(listOf(GearDataOutput.fromGear(Gear("CHL", "SUPER CHALUT", "CHALUT"))), "a1b2"),
        )

        // When
        api
            .perform(get("/bff/v1/gears"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().doesNotExist("Cache-Control"))
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].code", equalTo("CHL")))
            .andExpect(jsonPath("$[0].name", equalTo("SUPER CHALUT")))
            .andExpect(jsonPath("$[0].category", equalTo("CHALUT")))
    }

    @Test
    fun `Should let the browser keep the gears requested with their current version`() {
        // Given
        given(this.referentialSnapshots.gears()).willReturn(
            VersionedReferential(listOf(GearDataOutput.fromGear(Gear("CHL", "SUPER CHALUT", "CHALUT"))), "a1b2"),
        )

        // When
        api
            .perform(get("/bff/v1/gears?v=a1b2"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"))
            .andExpect(jsonPath("$[0].code", equalTo("CHL")))
    }

    @Test
    fun `Should not let the browser keep the gears requested with an outdated version`() {
        // Given
        given(this.referentialSnapshots.gears()).willReturn(
            VersionedReferential(listOf(GearDataOutput.fromGear(Gear("CHL", "SUPER CHALUT", "CHALUT"))), "c3d4"),
        )

        // When
        api
            .perform(get("/bff/v1/gears?v=a1b2"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().doesNotExist("Cache-Control"))
    }

    @Test
    fun `Should get all species`() {
        // Given
        given(this.referentialSnapshots.species()).willReturn(
            VersionedReferential(
                SpeciesAndSpeciesGroupsDataOutput.fromSpeciesAndSpeciesGroups(
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
                ),
                "e5f6",
            ),
        )

        // When
        api
            .perform(get("/bff/v1/species?v=e5f6"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"))
            .andExpect(jsonPath("$.species.length()", equalTo(1)))
            .andExpect(jsonPath("$.groups.length()", equalTo(1)))
    }
}
