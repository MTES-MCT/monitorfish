package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllPositions
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate.EPOCH
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(ApiController::class)])
class APIControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getAllPositions: GetAllPositions

    @Test
    fun `Should get all positions`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val pastFixedDateTime = ZonedDateTime.of(EPOCH.plusYears(10), LocalTime.MIN.plusSeconds(1), ZoneId.of("UTC"));
        val position = Position(0, "IMEI", 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime, pastFixedDateTime)
        given(this.getAllPositions.execute()).willReturn(listOf(position))

        // When
        mockMvc.perform(get("/api/v1/positions"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$[0].id", equalTo(position.id)))
                .andExpect(jsonPath("$[0].imei", equalTo(position.IMEI)))
                .andExpect(jsonPath("$[0].latitude", equalTo(position.latitude)))
                .andExpect(jsonPath("$[0].longitude", equalTo(position.longitude)))
                .andExpect(jsonPath("$[0].speed", equalTo(position.speed)))
                .andExpect(jsonPath("$[0].direction", equalTo(position.direction)))
                .andExpect(jsonPath("$[0].positionDate", equalTo(position.positionDate.toOffsetDateTime().toString())))
                .andExpect(jsonPath("$[0].receivedDate", equalTo(position.receivedDate.toOffsetDateTime().toString())))
    }
}