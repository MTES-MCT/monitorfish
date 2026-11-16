package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.dummyInfractionThreatCharacterizations
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
@WebMvcTest(value = [(InfractionController::class)])
class InfractionControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var referentialSnapshots: ReferentialSnapshots

    @MockitoBean
    private lateinit var getAllInfractionThreatCharacterization: GetAllInfractionThreatCharacterization

    @Test
    fun `Should get all fishing infractions`() {
        // Given
        given(this.referentialSnapshots.infractions()).willReturn(
            VersionedReferential(
                listOf(
                    Infraction(
                        natinfCode = 7059,
                        infractionCategory = InfractionCategory.FISHING,
                    ),
                    Infraction(
                        natinfCode = 7065,
                        infractionCategory = InfractionCategory.FISHING,
                    ),
                ).map { InfractionDataOutput.fromInfraction(it) },
                "a1b2",
            ),
        )

        // When
        api
            .perform(get("/api/v1/infractions?v=a1b2"))
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"))
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$[1].natinfCode", equalTo(7065)))
    }

    @Test
    fun `Should get all threat characterization`() {
        // Given
        given(this.getAllInfractionThreatCharacterization.execute()).willReturn(
            dummyInfractionThreatCharacterizations,
        )

        // When
        api
            .perform(get("/api/v1/infractions/threats"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(3)))
            .andExpect(jsonPath("$[0].children.length()", equalTo(7)))
            .andExpect(jsonPath("$[1].label", equalTo("Entrave au contrôle")))
    }
}
