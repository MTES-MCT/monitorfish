package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.CreateOrUpdateFleetSegmentDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.lang.IllegalArgumentException

@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(FleetSegmentController::class)])
class FleetSegmentControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getAllFleetSegmentsByYear: GetAllFleetSegmentsByYear

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

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all fleet segments of a year`() {
        // Given
        given(this.getAllFleetSegmentsByYear.execute(2021)).willReturn(
            listOf(FleetSegment("SW1", "", listOf("NAMO", "SA"), listOf(), listOf(), listOf(), listOf(), 1.2, 2021))
        )

        // When
        mockMvc.perform(get("/bff/v1/fleet_segments/2021"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].segment", equalTo("SW1")))
            .andExpect(jsonPath("$[0].year", equalTo(2021)))
            .andExpect(jsonPath("$[0].dirm[0]", equalTo("NAMO")))
    }

    @Test
    fun `Should update a fleet segment`() {
        // Given
        given(this.updateFleetSegment.execute(any(), any(), eq(2021)))
            .willReturn(
                FleetSegment(
                    "A_SEGMENT/WITH/SLASH",
                    "",
                    listOf("NAMO", "SA"),
                    listOf("OTB", "OTC"),
                    listOf(),
                    listOf(),
                    listOf(),
                    1.2,
                    2021
                )
            )

        // When
        mockMvc.perform(
            put("/bff/v1/fleet_segments?year=2021&segment=A_SEGMENT/WITH/SLASH")
                .content(
                    objectMapper.writeValueAsString(CreateOrUpdateFleetSegmentDataInput(gears = listOf("OTB", "OTC")))
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.segment", equalTo("A_SEGMENT/WITH/SLASH")))
            .andExpect(jsonPath("$.gears[0]", equalTo("OTB")))

        Mockito.verify(updateFleetSegment).execute(
            "A_SEGMENT/WITH/SLASH",
            CreateOrUpdateFleetSegmentFields(gears = listOf("OTB", "OTC")),
            2021
        )
    }

    @Test
    fun `Should return Ok When a delete of a fleet segment is done`() {
        // When
        mockMvc.perform(delete("/bff/v1/fleet_segments?year=2021&segment=A_SEGMENT/WITH/SLASH"))
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should return Ok When a new year is created`() {
        // When
        mockMvc.perform(post("/bff/v1/fleet_segments/2023"))
            // Then
            .andExpect(status().isCreated)
    }

    @Test
    fun `Should create a fleet segment`() {
        // Given
        given(createFleetSegment.execute(any()))
            .willReturn(
                FleetSegment("SW1", "", listOf("NAMO", "SA"), listOf(), listOf(), listOf(), listOf(), 1.2, 2022)
            )

        // When
        mockMvc.perform(
            post("/bff/v1/fleet_segments")
                .content(
                    objectMapper.writeValueAsString(
                        CreateOrUpdateFleetSegmentDataInput(
                            segment = "SEGMENT",
                            gears = listOf("OTB", "OTC"),
                            year = 2022
                        )
                    )
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            // Then
            .andExpect(status().isCreated)

        Mockito.verify(createFleetSegment).execute(
            CreateOrUpdateFleetSegmentFields(segment = "SEGMENT", gears = listOf("OTB", "OTC"), year = 2022)
        )
    }

    @Test
    fun `Should throw an exception When no year given to create a fleet segment`() {
        // Given
        given(createFleetSegment.execute(any()))
            .willThrow(IllegalArgumentException("Year must be provided"))

        // When
        mockMvc.perform(
            post("/bff/v1/fleet_segments")
                .content(
                    objectMapper.writeValueAsString(
                        CreateOrUpdateFleetSegmentDataInput(segment = "SEGMENT", gears = listOf("OTB", "OTC"))
                    )
                )
                .contentType(MediaType.APPLICATION_JSON)
        )
            // Then
            .andExpect(status().isBadRequest)

        Mockito.verify(createFleetSegment).execute(
            CreateOrUpdateFleetSegmentFields(segment = "SEGMENT", gears = listOf("OTB", "OTC"))
        )
    }
}
