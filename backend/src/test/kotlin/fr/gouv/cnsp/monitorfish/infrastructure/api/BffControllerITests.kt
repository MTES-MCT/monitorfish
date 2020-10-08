package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetAllPositions
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
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
@WebMvcTest(value = [(BffController::class)])
class BffControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getAllPositions: GetAllPositions

    @Test
    fun `Should get all positions`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val position = Position(0, "MMSI", null, null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime)
        given(this.getAllPositions.execute()).willReturn(listOf(position))

        // When
        mockMvc.perform(get("/bff/v1/positions"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$[0].vesselName", equalTo(position.vesselName)))
                .andExpect(jsonPath("$[0].mmsi", equalTo(position.MMSI)))
                .andExpect(jsonPath("$[0].externalReferenceNumber", equalTo(position.externalReferenceNumber)))
                .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo(position.internalReferenceNumber)))
                .andExpect(jsonPath("$[0].ircs", equalTo(position.IRCS)))
                .andExpect(jsonPath("$[0].flagState", equalTo(position.flagState)))
                .andExpect(jsonPath("$[0].latitude", equalTo(position.latitude)))
                .andExpect(jsonPath("$[0].longitude", equalTo(position.longitude)))
                .andExpect(jsonPath("$[0].speed", equalTo(position.speed)))
                .andExpect(jsonPath("$[0].course", equalTo(position.course)))
                .andExpect(jsonPath("$[0].from", equalTo(position.from)))
                .andExpect(jsonPath("$[0].destination", equalTo(position.destination)))
                .andExpect(jsonPath("$[0].positionType", equalTo(PositionType.AIS.toString())))
                .andExpect(jsonPath("$[0].dateTime", equalTo(position.dateTime.toOffsetDateTime().toString())))
    }
}