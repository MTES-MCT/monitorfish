package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.MeterRegistryConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.*
import fr.gouv.cnsp.monitorfish.domain.entities.controls.Control
import fr.gouv.cnsp.monitorfish.domain.entities.controls.Controller
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.use_cases.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import io.micrometer.core.instrument.MeterRegistry
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
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate.EPOCH
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

@Import(MeterRegistryConfiguration::class)
@ExtendWith(SpringExtension::class)
@WebMvcTest(value = [(BffController::class)])
class BffControllerITests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getLastPositions: GetLastPositions

    @MockBean
    private lateinit var getVessel: GetVessel

    @MockBean
    private lateinit var getAllGears: GetAllGears

    @MockBean
    private lateinit var getAllSpecies: GetAllSpecies

    @MockBean
    private lateinit var getVesselVoyage: GetVesselVoyage

    @MockBean
    private lateinit var searchVessels: SearchVessels

    @MockBean
    private lateinit var getVesselControls: GetVesselControls

    @MockBean
    private lateinit var getAllFleetSegments: GetAllFleetSegments

    @MockBean
    private lateinit var getHealthcheck: GetHealthcheck

    @Autowired
    private lateinit var meterRegistry: MeterRegistry

    @Test
    fun `Should get all positions`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"));
        val position = LastPosition(0, "MMSI", null, null, null, null, null, PositionType.AIS, 16.445, 48.2525, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime)
        given(this.getLastPositions.execute()).willReturn(listOf(position))

        // When
        mockMvc.perform(get("/bff/v1/vessels"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$[0].vesselName", equalTo(position.vesselName)))
                .andExpect(jsonPath("$[0].mmsi", equalTo(position.mmsi)))
                .andExpect(jsonPath("$[0].externalReferenceNumber", equalTo(position.externalReferenceNumber)))
                .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo(position.internalReferenceNumber)))
                .andExpect(jsonPath("$[0].ircs", equalTo(position.ircs)))
                .andExpect(jsonPath("$[0].flagState", equalTo(position.flagState)))
                .andExpect(jsonPath("$[0].latitude", equalTo(position.latitude)))
                .andExpect(jsonPath("$[0].longitude", equalTo(position.longitude)))
                .andExpect(jsonPath("$[0].estimatedCurrentLatitude", equalTo(position.estimatedCurrentLatitude)))
                .andExpect(jsonPath("$[0].estimatedCurrentLongitude", equalTo(position.estimatedCurrentLongitude)))
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
    fun `Should throw an exception When vesselIdentifier is not given as parameter`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        givenSuspended { getVessel.execute(any(), any(), any(), any(), any(), eq(null), eq(null)) } willReturn {
            Pair(false, VesselWithData(
                    Vessel(internalReferenceNumber = "FR224226850", vesselName = "MY AWESOME VESSEL", flagState = CountryCode.FR, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing"),
                    listOf(firstPosition, secondPosition, thirdPosition),
                    VesselRiskFactor(2.3, 2.0, 1.9, 3.2)))
        }

        // When
        mockMvc.perform(get("/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS"))
                // Then
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.error", equalTo("Parameter \"vesselIdentifier\" is missing.")))
    }

    @Test
    fun `Should get vessels with last positions and risk factor`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        givenSuspended { getVessel.execute(any(), any(), any(), any(), any(), eq(null), eq(null)) } willReturn {
            Pair(false, VesselWithData(
                    Vessel(internalReferenceNumber = "FR224226850", vesselName = "MY AWESOME VESSEL", flagState = CountryCode.FR, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing"),
                    listOf(firstPosition, secondPosition, thirdPosition),
                    VesselRiskFactor(2.3, 2.0, 1.9, 3.2)))
        }

        // When
        mockMvc.perform(get("/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=UNDEFINED"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.declaredFishingGears[0]", equalTo("Trémails")))
                .andExpect(jsonPath("$.vesselType", equalTo("Fishing")))
                .andExpect(jsonPath("$.flagState", equalTo("FR")))
                .andExpect(jsonPath("$.vesselName", equalTo("MY AWESOME VESSEL")))
                .andExpect(jsonPath("$.internalReferenceNumber", equalTo("FR224226850")))
                .andExpect(jsonPath("$.positions.length()", equalTo(3)))
                .andExpect(jsonPath("$.riskFactor.controlPriorityLevel", equalTo(1.0)))
                .andExpect(jsonPath("$.riskFactor.riskFactor", equalTo(3.2)))

        runBlocking {
            Mockito.verify(getVessel).execute("FR224226850", "123", "IEF4", VesselTrackDepth.TWELVE_HOURS, VesselIdentifier.UNDEFINED, null, null)
        }
    }

    @Test
    fun `Should get vessels's last positions and data with a FOUND header When the DEP message was not found`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        givenSuspended { getVessel.execute(any(), any(), any(), any(), any(), eq(null), eq(null)) } willReturn {
            Pair(true, VesselWithData(
                    Vessel(internalReferenceNumber = "FR224226850", vesselName = "MY AWESOME VESSEL", flagState = CountryCode.FR, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing"),
                    listOf(firstPosition, secondPosition, thirdPosition),
                    VesselRiskFactor(2.3, 2.0, 1.9, 3.2)))
        }

        // When
        mockMvc.perform(get("/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=UNDEFINED"))
                // Then
                .andExpect(status().isAccepted)
                .andExpect(jsonPath("$.declaredFishingGears[0]", equalTo("Trémails")))
                .andExpect(jsonPath("$.vesselType", equalTo("Fishing")))
                .andExpect(jsonPath("$.flagState", equalTo("FR")))
                .andExpect(jsonPath("$.vesselName", equalTo("MY AWESOME VESSEL")))
                .andExpect(jsonPath("$.internalReferenceNumber", equalTo("FR224226850")))
                .andExpect(jsonPath("$.positions.length()", equalTo(3)))

        runBlocking {
            Mockito.verify(getVessel).execute("FR224226850", "123", "IEF4", VesselTrackDepth.TWELVE_HOURS, VesselIdentifier.UNDEFINED, null, null)
        }
    }

    @Test
    fun `Should get vessels's last positions and data When from and to date parameters are set`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(4))
        val secondPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(3))
        val thirdPosition = Position(null, "FR224226850", "224226850", null, null, null, null, PositionType.AIS, false, 16.445, 48.2525, 1.8, 180.0, now.minusHours(2))
        givenSuspended { getVessel.execute(any(), any(), any(), any(), any(), any(), any()) } willReturn {
            Pair(false, VesselWithData(
                    Vessel(internalReferenceNumber = "FR224226850", vesselName = "MY AWESOME VESSEL", flagState = CountryCode.FR, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing"),
                    listOf(firstPosition, secondPosition, thirdPosition),
                    VesselRiskFactor(2.3, 2.0, 1.9, 3.2)))
        }

        // When
        mockMvc.perform(get("/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123" +
                "&IRCS=IEF4&trackDepth=CUSTOM&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&afterDateTime=2021-03-24T22:07:00.000Z&beforeDateTime=2021-04-24T22:07:00.000Z"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.declaredFishingGears[0]", equalTo("Trémails")))
                .andExpect(jsonPath("$.vesselType", equalTo("Fishing")))
                .andExpect(jsonPath("$.flagState", equalTo("FR")))
                .andExpect(jsonPath("$.vesselName", equalTo("MY AWESOME VESSEL")))
                .andExpect(jsonPath("$.internalReferenceNumber", equalTo("FR224226850")))
                .andExpect(jsonPath("$.positions.length()", equalTo(3)))

        runBlocking {
            Mockito.verify(getVessel).execute(
                    "FR224226850",
                    "123",
                    "IEF4",
                    VesselTrackDepth.CUSTOM,
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    ZonedDateTime.parse("2021-03-24T22:07:00Z"),
                    ZonedDateTime.parse("2021-04-24T22:07:00Z"))
        }
    }

    @Test
    fun `Should get all gears`() {
        // Given
        given(this.getAllGears.execute()).willReturn(listOf(Gear("CHL", "SUPER CHALUT", "CHALUT")))

        // When
        mockMvc.perform(get("/bff/v1/gears"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", equalTo(1)))
                .andExpect(jsonPath("$[0].code", equalTo("CHL")))
                .andExpect(jsonPath("$[0].name", equalTo("SUPER CHALUT")))
                .andExpect(jsonPath("$[0].category", equalTo("CHALUT")))
    }

    @Test
    fun `Should search for a vessel`() {
        // Given
        given(this.searchVessels.execute(any())).willReturn(listOf(
                Vessel(internalReferenceNumber = "FR224226850", vesselName = "MY AWESOME VESSEL", flagState = CountryCode.FR, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing"),
                Vessel(internalReferenceNumber = "GBR21555445", vesselName = "ANOTHER VESSEL", flagState = CountryCode.GB, declaredFishingGears = listOf("Trémails"), vesselType = "Fishing")))

        // When
        mockMvc.perform(get("/bff/v1/vessels/search?searched=VESSEL"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", equalTo(2)))
                .andExpect(jsonPath("$[0].flagState", equalTo("FR")))
                .andExpect(jsonPath("$[0].vesselName", equalTo("MY AWESOME VESSEL")))
                .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo("FR224226850")))
                .andExpect(jsonPath("$[1].flagState", equalTo("GB")))
                .andExpect(jsonPath("$[1].vesselName", equalTo("ANOTHER VESSEL")))
                .andExpect(jsonPath("$[1].internalReferenceNumber", equalTo("GBR21555445")))

        Mockito.verify(searchVessels).execute("VESSEL")
    }

    @Test
    fun `Should find the last ERS messages of vessels`() {
        // Given
        val voyage = Voyage(true, false, ZonedDateTime.parse("2021-01-21T10:21:26.617301+01:00"), null, ERSMessagesAndAlerts(TestUtils.getDummyERSMessage(), listOf()))
        given(this.getVesselVoyage.execute(any(), any(), anyOrNull())).willReturn(voyage)

        // When
        mockMvc.perform(get("/bff/v1/ers/find?internalReferenceNumber=FR224226850&voyageRequest=LAST&beforeDateTime="))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", equalTo(5)))
                .andExpect(jsonPath("$.isLastVoyage", equalTo(true)))
                .andExpect(jsonPath("$.isFirstVoyage", equalTo(false)))
                .andExpect(jsonPath("$.startDate", equalTo("2021-01-21T10:21:26.617301+01:00")))
                .andExpect(jsonPath("$.endDate", equalTo(null)))
                .andExpect(jsonPath("$.ersMessagesAndAlerts.ersMessages.length()", equalTo(3)))
                .andExpect(jsonPath("$.ersMessagesAndAlerts.ersMessages[0].messageType", equalTo("DEP")))
                .andExpect(jsonPath("$.ersMessagesAndAlerts.ersMessages[0].tripNumber", equalTo(345)))
                .andExpect(jsonPath("$.ersMessagesAndAlerts.ersMessages[0].operationDateTime", equalTo("2020-05-04T03:04:05.000000003Z")))

        Mockito.verify(getVesselVoyage).execute("FR224226850", VoyageRequest.LAST, null)
    }

    @Test
    fun `Should find the ERS messages of vessels before a specified date`() {
        // Given
        val voyage = Voyage(true, false, ZonedDateTime.now().minusMonths(5), null, ERSMessagesAndAlerts(TestUtils.getDummyERSMessage(), listOf()))
        given(this.getVesselVoyage.execute(any(), any(), any())).willReturn(voyage)

        // When
        mockMvc.perform(get("/bff/v1/ers/find?internalReferenceNumber=FR224226850&voyageRequest=PREVIOUS&dateTime=2021-05-04T03:04:05.000Z"))

        Mockito.verify(getVesselVoyage).execute(
            "FR224226850",
            VoyageRequest.PREVIOUS,
            ZonedDateTime.parse("2021-05-04T03:04:05.000Z"))
    }

    @Test
    fun `Should get all controls for a vessel`() {
        // Given
        given(this.getVesselControls.execute(any(), any())).willReturn(ControlResumeAndControls(
                1,
                1,
                3,
                0,
                1,
                2,
                3,
                4,
                5,
                listOf(Control(1, 1, Controller(1, "Controlleur")))))

        // When
        mockMvc.perform(get("/bff/v1/vessels/123/controls?afterDateTime=2020-05-04T03:04:05.000Z"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.numberOfSeizures", equalTo(1)))
                .andExpect(jsonPath("$.numberOfSeaControls", equalTo(1)))
                .andExpect(jsonPath("$.controls.length()", equalTo(1)))

        Mockito.verify(getVesselControls).execute(123, ZonedDateTime.parse("2020-05-04T03:04:05Z"))
    }

    @Test
    fun `Should get all fleet segments`() {
        // Given
        given(this.getAllFleetSegments.execute()).willReturn(listOf(FleetSegment("SW1", "", listOf("NAMO", "SA"), listOf(), listOf(), listOf(), listOf())))

        // When
        mockMvc.perform(get("/bff/v1/fleet_segments"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", equalTo(1)))
                .andExpect(jsonPath("$[0].segment", equalTo("SW1")))
                .andExpect(jsonPath("$[0].dirm[0]", equalTo("NAMO")))
    }

    @Test
    fun `Should get the health check`() {
        // Given
        given(this.getHealthcheck.execute()).willReturn(Health(
                ZonedDateTime.parse("2020-12-21T15:01:00Z"),
                ZonedDateTime.parse("2020-12-21T16:01:00Z"),
                ZonedDateTime.parse("2020-12-21T17:01:00Z")))

        // When
        mockMvc.perform(get("/bff/v1/healthcheck"))
                // Then
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.datePositionReceived", equalTo("2020-12-21T15:01:00Z")))
                .andExpect(jsonPath("$.dateLastPosition", equalTo("2020-12-21T16:01:00Z")))
                .andExpect(jsonPath("$.dateERSMessageReceived", equalTo("2020-12-21T17:01:00Z")))
    }
}
