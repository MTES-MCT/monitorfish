package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddControlObjectiveDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateControlObjectiveDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(ControlObjectiveAdminController::class)])
class ControlObjectiveAdminControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var updateControlObjective: UpdateControlObjective

    @MockitoBean
    private lateinit var getControlObjectiveOfYear: GetControlObjectivesOfYear

    @MockitoBean
    private lateinit var getControlObjectiveYearEntries: GetControlObjectiveYearEntries

    @MockitoBean
    private lateinit var deleteControlObjective: DeleteControlObjective

    @MockitoBean
    private lateinit var addControlObjective: AddControlObjective

    @MockitoBean
    private lateinit var addControlObjectiveYear: AddControlObjectiveYear

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should return Created When an update of a control objective is done`() {
        // When
        api
            .perform(
                put("/bff/v1/admin/control_objectives/123")
                    .content(
                        objectMapper.writeValueAsString(
                            UpdateControlObjectiveDataInput(targetNumberOfControlsAtSea = 123),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should return Ok When a delete of a control objective is done`() {
        // When
        api
            .perform(delete("/bff/v1/admin/control_objectives/123"))
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should return the id When a adding a control objective`() {
        // When
        api
            .perform(
                post("/bff/v1/admin/control_objectives")
                    .content(
                        objectMapper.writeValueAsString(
                            AddControlObjectiveDataInput(segment = "SEGMENT", facade = "FACADE", year = 2021),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should get all control objective for a given year`() {
        // Given
        given(this.getControlObjectiveOfYear.execute(2021)).willReturn(
            listOf(
                ControlObjective(
                    1,
                    facade = "NAME",
                    segment = "SWW01",
                    targetNumberOfControlsAtSea = 23,
                    targetNumberOfControlsAtPort = 102,
                    controlPriorityLevel = 1.0,
                    year = 2021,
                ),
                ControlObjective(
                    1,
                    facade = "NAME",
                    segment = "SWW01",
                    targetNumberOfControlsAtSea = 23,
                    targetNumberOfControlsAtPort = 102,
                    controlPriorityLevel = 1.0,
                    year = 2021,
                ),
                ControlObjective(
                    1,
                    facade = "NAME",
                    segment = "SWW01",
                    targetNumberOfControlsAtSea = 23,
                    targetNumberOfControlsAtPort = 102,
                    controlPriorityLevel = 1.0,
                    year = 2021,
                ),
            ),
        )

        // When
        api
            .perform(get("/bff/v1/admin/control_objectives/2021"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(3)))
    }

    @Test
    fun `Should get all control objective year entries`() {
        // Given
        given(this.getControlObjectiveYearEntries.execute()).willReturn(listOf(2021, 2022))

        // When
        api
            .perform(get("/bff/v1/admin/control_objectives/years"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0]", equalTo(2021)))
    }

    @Test
    fun `Should add a new control objective year`() {
        // When
        api
            .perform(post("/bff/v1/admin/control_objectives/years"))
            // Then
            .andExpect(status().isCreated)
    }
}
