package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegmentsFromControl
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.GetAllFleetSegmentsByYear
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ComputeFleetSegmentsDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.GearControlDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SpeciesControlDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(FleetSegmentController::class)])
class FleetSegmentControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllFleetSegmentsByYear: GetAllFleetSegmentsByYear

    @MockBean
    private lateinit var computeFleetSegmentsFromControl: ComputeFleetSegmentsFromControl

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all fleet segments of a year`() {
        // Given
        given(this.getAllFleetSegmentsByYear.execute(2021)).willReturn(
            listOf(
                FleetSegment(
                    segment = "SW1",
                    segmentName = "",
                    impactRiskFactor = 1.2,
                    year = 2021,
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                    mainScipSpeciesType = null,
                    maxMesh = null,
                    minMesh = null,
                    minShareOfTargetSpecies = 0.2,
                    priority = 0.0,
                    vesselTypes = listOf(),
                    gears = listOf(),
                ),
            ),
        )

        // When
        api.perform(get("/bff/v1/fleet_segments/2021"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].segment", equalTo("SW1")))
            .andExpect(jsonPath("$[0].year", equalTo(2021)))
            .andExpect(jsonPath("$[0].minShareOfTargetSpecies", equalTo(0.2)))
    }

    @Test
    fun `Should compute fleet segments`() {
        // Given
        given(this.computeFleetSegmentsFromControl.execute(any(), any(), any(), any())).willReturn(
            listOf(
                FleetSegment(
                    segment = "SWW01",
                    segmentName = "",
                    impactRiskFactor = 1.2,
                    year = 2021,
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                    mainScipSpeciesType = null,
                    maxMesh = null,
                    minMesh = null,
                    minShareOfTargetSpecies = null,
                    priority = 0.0,
                    vesselTypes = listOf(),
                    gears = listOf(),
                ),
            ),
        )

        // When
        api.perform(
            post("/bff/v1/fleet_segments/compute")
                .content(
                    objectMapper.writeValueAsString(
                        ComputeFleetSegmentsDataInput(
                            faoAreas = listOf("27.1.c", "27.1.b"),
                            vesselId = 123,
                            gears =
                                listOf(
                                    GearControlDataInput(
                                        gearCode = "OTB",
                                        gearName = null,
                                        declaredMesh = null,
                                        controlledMesh = null,
                                        hasUncontrolledMesh = null,
                                        gearWasControlled = null,
                                        comments = null,
                                    ),
                                ),
                            species =
                                listOf(
                                    SpeciesControlDataInput(
                                        speciesCode = "HKE",
                                        nbFish = null,
                                        declaredWeight = null,
                                        controlledWeight = null,
                                        underSized = null,
                                    ),
                                    SpeciesControlDataInput(
                                        speciesCode = "BFT",
                                        nbFish = null,
                                        declaredWeight = null,
                                        controlledWeight = null,
                                        underSized = null,
                                    ),
                                ),
                        ),
                    ),
                )
                .contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].segment", equalTo("SWW01")))
    }
}
