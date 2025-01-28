package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateOrUpdateFleetSegmentDataInput
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(FleetSegmentAdminController::class)])
class FleetSegmentAdminControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var updateFleetSegment: UpdateFleetSegment

    @MockBean
    private lateinit var deleteFleetSegment: DeleteFleetSegment

    @MockBean
    private lateinit var createFleetSegment: CreateFleetSegment

    @MockBean
    private lateinit var getFleetSegmentYearEntries: GetFleetSegmentYearEntries

    @MockBean
    private lateinit var addFleetSegmentYear: AddFleetSegmentYear

    @MockBean
    private lateinit var computeFleetSegments: ComputeFleetSegments

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should update a fleet segment`() {
        // Given
        given(this.updateFleetSegment.execute(any(), any()))
            .willReturn(
                FleetSegment(
                    segment = "A_SEGMENT/WITH/SLASH",
                    segmentName = "",
                    gears = listOf("OTB", "OTC"),
                    priority = 1.2,
                    year = 2021,
                    vesselTypes = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                    impactRiskFactor = 0.0,
                    mainScipSpeciesType = null,
                    maxMesh = null,
                    minMesh = null,
                    minShareOfTargetSpecies = null,
                ),
            )

        // When
        api
            .perform(
                put("/bff/v1/admin/fleet_segments?segment=A_SEGMENT/WITH/SLASH")
                    .content(
                        objectMapper.writeValueAsString(
                            CreateOrUpdateFleetSegmentDataInput(
                                gears = listOf("OTB", "OTC"),
                                segment = "A_SEGMENT",
                                segmentName = null,
                                faoAreas = null,
                                targetSpecies = null,
                                mainScipSpeciesType = null,
                                maxMesh = null,
                                minMesh = null,
                                minShareOfTargetSpecies = null,
                                priority = 0.0,
                                vesselTypes = listOf(),
                                impactRiskFactor = null,
                                year = 2021,
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.segment", equalTo("A_SEGMENT/WITH/SLASH")))
            .andExpect(jsonPath("$.gears[0]", equalTo("OTB")))
    }

    @Test
    fun `Should return Ok When a delete of a fleet segment is done`() {
        // When
        api
            .perform(delete("/bff/v1/admin/fleet_segments?year=2021&segment=A_SEGMENT/WITH/SLASH"))
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should return Ok When a new year is created`() {
        // When
        api
            .perform(post("/bff/v1/admin/fleet_segments/2023"))
            // Then
            .andExpect(status().isCreated)
    }

    @Test
    fun `Should create a fleet segment`() {
        // Given
        given(createFleetSegment.execute(any()))
            .willReturn(
                FleetSegment(
                    segment = "SW1",
                    segmentName = "",
                    year = 2022,
                    gears = listOf("OTB", "OTC"),
                    priority = 1.2,
                    vesselTypes = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                    impactRiskFactor = 1.2,
                    mainScipSpeciesType = null,
                    maxMesh = null,
                    minMesh = null,
                    minShareOfTargetSpecies = null,
                ),
            )

        // When
        api
            .perform(
                post("/bff/v1/admin/fleet_segments")
                    .content(
                        objectMapper.writeValueAsString(
                            CreateOrUpdateFleetSegmentDataInput(
                                segment = "SEGMENT",
                                gears = listOf("OTB", "OTC"),
                                year = 2022,
                                segmentName = "",
                                priority = 1.2,
                                vesselTypes = listOf(),
                                faoAreas = listOf(),
                                targetSpecies = listOf(),
                                impactRiskFactor = 1.2,
                                mainScipSpeciesType = null,
                                maxMesh = null,
                                minMesh = null,
                                minShareOfTargetSpecies = null,
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)
    }
}
