package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.ComputeFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.GetAllFleetSegmentsByYear
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito
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
@WebMvcTest(value = [(FleetSegmentController::class)])
class FleetSegmentControllerITests {

    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAllFleetSegmentsByYear: GetAllFleetSegmentsByYear

    @MockBean
    private lateinit var computeFleetSegments: ComputeFleetSegments

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all fleet segments of a year`() {
        // Given
        given(this.getAllFleetSegmentsByYear.execute(2021)).willReturn(
            listOf(FleetSegment("SW1", "", listOf("NAMO", "SA"), listOf(), listOf(), listOf(), listOf(), 1.2, 2021)),
        )

        // When
        api.perform(get("/bff/v1/fleet_segments/2021"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].segment", equalTo("SW1")))
            .andExpect(jsonPath("$[0].year", equalTo(2021)))
            .andExpect(jsonPath("$[0].dirm[0]", equalTo("NAMO")))
    }

    @Test
    fun `Should compute fleet segments`() {
        // Given
        given(this.computeFleetSegments.execute(any(), any(), any())).willReturn(
            listOf(FleetSegment("SWW01", "", listOf("NAMO", "SA"), listOf(), listOf(), listOf(), listOf(), 1.2, 2021)),
        )

        // When
        api.perform(
            get(
                "/bff/v1/fleet_segments/compute?faoAreas=27.1.c,27.1.b&gears=OTB&species=HKE,BFT",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].segment", equalTo("SWW01")))

        Mockito.verify(computeFleetSegments).execute(
            listOf("27.1.c", "27.1.b"),
            listOf("OTB"),
            listOf("HKE", "BFT"),
        )
    }
}
