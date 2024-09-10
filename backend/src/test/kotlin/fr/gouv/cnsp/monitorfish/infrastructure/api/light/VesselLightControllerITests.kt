package fr.gouv.cnsp.monitorfish.infrastructure.api.light

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselInformation
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselTrackDepth
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetVesselReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
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
import java.time.LocalDate.EPOCH
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(VesselLightController::class)])
class VesselLightControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getLastPositions: GetLastPositions

    @MockBean
    private lateinit var getVessel: GetVessel

    @MockBean
    private lateinit var getVesselPositions: GetVesselPositions

    @MockBean
    private lateinit var getVesselVoyage: GetVesselVoyage

    @MockBean
    private lateinit var searchVessels: SearchVessels

    @MockBean
    private lateinit var getVesselReportings: GetVesselReportings

    @MockBean
    private lateinit var getVesselRiskFactor: GetVesselRiskFactor

    @MockBean
    private lateinit var getVesselBeaconMalfunctions: GetVesselBeaconMalfunctions

    @MockBean
    private lateinit var getVesselLastTripNumbers: GetVesselLastTripNumbers

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should get all vessels last positions`() {
        // Given
        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"))
        val position =
            LastPosition(0, 1, "MMSI", null, null, null, null, CountryCode.FR, PositionType.AIS, 16.445, 48.2525, 16.445, 48.2525, 1.8, 180.0, farPastFixedDateTime, vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER)
        given(this.getLastPositions.execute()).willReturn(listOf(position))

        // When
        api.perform(get("/light/v1/vessels"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].vesselName", equalTo(position.vesselName)))
            .andExpect(jsonPath("$[0].vesselId", equalTo(position.vesselId)))
            .andExpect(jsonPath("$[0].mmsi", equalTo(position.mmsi)))
            .andExpect(jsonPath("$[0].externalReferenceNumber", equalTo(position.externalReferenceNumber)))
            .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo(position.internalReferenceNumber)))
            .andExpect(jsonPath("$[0].ircs", equalTo(position.ircs)))
            .andExpect(jsonPath("$[0].flagState", equalTo(position.flagState.toString())))
            .andExpect(jsonPath("$[0].latitude", equalTo(position.latitude)))
            .andExpect(jsonPath("$[0].longitude", equalTo(position.longitude)))
            .andExpect(jsonPath("$[0].estimatedCurrentLatitude", equalTo(position.estimatedCurrentLatitude)))
            .andExpect(jsonPath("$[0].estimatedCurrentLongitude", equalTo(position.estimatedCurrentLongitude)))
            .andExpect(jsonPath("$[0].speed", equalTo(position.speed)))
            .andExpect(jsonPath("$[0].course", equalTo(position.course)))
            .andExpect(jsonPath("$[0].positionType", equalTo(PositionType.AIS.toString())))
            .andExpect(jsonPath("$[0].dateTime", equalTo(position.dateTime.toOffsetDateTime().toString())))
            .andExpect(jsonPath("$[0].reportings.length()").doesNotExist())
            .andExpect(jsonPath("$[0].postControlComment").doesNotExist())
            .andExpect(jsonPath("$[0].alerts.length()").doesNotExist())
    }

    private fun <T> givenSuspended(block: suspend () -> T) = given(runBlocking { block() })!!

    private infix fun <T> BDDMockito.BDDMyOngoingStubbing<T>.willReturn(block: () -> T) = willReturn(block())

    @Test
    fun `Should get vessels with last positions`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                isAtPort = false,
                dateTime =
                    now.minusHours(
                        4,
                    ),
            )
        val secondPosition =
            Position(
                id = null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                isAtPort = false,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
            Position(
                null,
                internalReferenceNumber = "FR224226850",
                mmsi = "224226850",
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = null,
                positionType = PositionType.AIS,
                isManual = false,
                isFishing = false,
                course = 16.445,
                latitude = 48.2525,
                longitude = 1.8,
                speed = 180.0,
                isAtPort = false,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        givenSuspended {
            getVessel.execute(eq(123), any(), any(), any(), any(), any(), eq(null), eq(null))
        } willReturn {
            Pair(
                false,
                VesselInformation(
                    Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                        hasLogbookEsacapt = false,
                    ),
                    null,
                    listOf(firstPosition, secondPosition, thirdPosition),
                    VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                ),
            )
        }

        // When
        api.perform(
            get(
                "/light/v1/vessels/find?vesselId=123&internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.vessel.declaredFishingGears[0]", equalTo("Trémails")))
            .andExpect(jsonPath("$.vessel.vesselType", equalTo("Fishing")))
            .andExpect(jsonPath("$.vessel.flagState", equalTo("FR")))
            .andExpect(jsonPath("$.vessel.vesselName", equalTo("MY AWESOME VESSEL")))
            .andExpect(jsonPath("$.vessel.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.positions.length()", equalTo(3)))
            .andExpect(jsonPath("$.vessel.riskFactor").doesNotExist())
            .andExpect(jsonPath("$.vessel.underCharter", equalTo(true)))

        runBlocking {
            Mockito.verify(getVessel).execute(
                123,
                "FR224226850",
                "123",
                "IEF4",
                VesselTrackDepth.TWELVE_HOURS,
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                null,
                null,
            )
        }
    }

    @Test
    fun `Should find the last logbook messages of vessels`() {
        // Given
        val voyage =
            Voyage(
                isLastVoyage = true,
                isFirstVoyage = false,
                startDate = ZonedDateTime.parse("2021-01-21T10:21:26.617301+01:00"),
                endDate = null,
                tripNumber = "1234",
                logbookMessagesAndAlerts = LogbookMessagesAndAlerts(TestUtils.getDummyLogbookMessages(), listOf()),
            )
        given(this.getVesselVoyage.execute(any(), any(), anyOrNull())).willReturn(voyage)

        // When
        api.perform(
            get(
                "/light/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=LAST&beforeDateTime=",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(6)))
            .andExpect(jsonPath("$.isLastVoyage", equalTo(true)))
            .andExpect(jsonPath("$.tripNumber", equalTo("1234")))
            .andExpect(jsonPath("$.isFirstVoyage", equalTo(false)))
            .andExpect(jsonPath("$.startDate", equalTo("2021-01-21T10:21:26.617301+01:00")))
            .andExpect(jsonPath("$.endDate", equalTo(null)))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages.length()", equalTo(6)))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].messageType", equalTo("DEP")))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].tripNumber", equalTo("345")))
            .andExpect(
                jsonPath(
                    "$.logbookMessagesAndAlerts.logbookMessages[1].reportDateTime",
                    equalTo("2020-05-04T03:04:05.000000003Z"),
                ),
            )
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].rawMessage").doesNotExist())

        Mockito.verify(getVesselVoyage).execute("FR224226850", VoyageRequest.LAST, null)
    }
}
