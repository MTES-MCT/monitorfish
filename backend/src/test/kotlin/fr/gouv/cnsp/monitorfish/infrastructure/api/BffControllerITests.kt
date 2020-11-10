package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetLastPositions
import fr.gouv.cnsp.monitorfish.domain.use_cases.GetVessel
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.mockito.BDDMockito.given
import org.mockito.Mockito
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
@WebMvcTest(value = [(BffController::class)])
class BffControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getLastPositions: GetLastPositions

    @MockBean
    private lateinit var getVessel: GetVessel

    @Test
    fun `Should get all positions`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val position = Position(0, "MMSI", null, null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime)
        given(this.getLastPositions.execute()).willReturn(listOf(position))

        // When
        mockMvc.perform(get("/bff/v1/vessels"))
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

    private fun <T> givenSuspended(block: suspend () -> T) = given(runBlocking { block() })!!

    private infix fun <T> BDDMockito.BDDMyOngoingStubbing<T>.willReturn(block: () -> T) = willReturn(block())

    @Test
    fun `Should get vessels's last positions`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        givenSuspended { getVessel.execute(any()) } willReturn {
            Pair(Vessel("FR224226850", "", "MY AWESOME VESSEL", CountryCode.FR, null, "Fishing"),
                listOf(firstPosition, secondPosition, thirdPosition))
        }

        // When
        mockMvc.perform(get("/bff/v1/vessels/FR224226850"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.gearType", equalTo(null)))
                .andExpect(jsonPath("$.vesselType", equalTo("Fishing")))
                .andExpect(jsonPath("$.flagState", equalTo("FR")))
                .andExpect(jsonPath("$.vesselName", equalTo("MY AWESOME VESSEL")))
                .andExpect(jsonPath("$.externalReferenceNumber", equalTo("")))
                .andExpect(jsonPath("$.internalReferenceNumber", equalTo("FR224226850")))
                .andExpect(jsonPath("$.positions.length()", equalTo(3)))

        runBlocking {
            Mockito.verify(getVessel).execute("FR224226850")
        }
    }
}
