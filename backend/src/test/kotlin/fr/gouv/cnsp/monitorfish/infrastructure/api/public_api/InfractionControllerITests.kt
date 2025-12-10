package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractionThreatCharacterization
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.dummyInfractionThreatCharacterizations
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(InfractionController::class)])
class InfractionControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllInfractions: GetAllInfractions

    @MockitoBean
    private lateinit var getAllInfractionThreatCharacterization: GetAllInfractionThreatCharacterization

    @Test
    fun `Should get all fishing infractions`() {
        // Given
        given(this.getAllInfractions.execute()).willReturn(
            listOf(
                Infraction(
                    natinfCode = 7059,
                    infractionCategory = InfractionCategory.FISHING,
                ),
                Infraction(
                    natinfCode = 7065,
                    infractionCategory = InfractionCategory.FISHING,
                ),
            ),
        )

        // When
        api
            .perform(get("/api/v1/infractions"))
            // Then
            .andExpect(status().isOk)
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
            .andExpect(jsonPath("$[1].name", equalTo("Entrave au contrôle")))
    }
}
