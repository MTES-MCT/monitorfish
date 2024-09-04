package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetAllInfractions
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
@WebMvcTest(value = [(InfractionController::class)])
class InfractionControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllInfractions: GetAllInfractions

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
        api.perform(get("/api/v1/infractions"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$[1].natinfCode", equalTo(7065)))
    }
}
