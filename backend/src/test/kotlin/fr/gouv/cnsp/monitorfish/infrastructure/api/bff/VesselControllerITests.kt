package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagesAndAlerts
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Voyage
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReportings
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import kotlinx.coroutines.CompletableDeferred
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
@WebMvcTest(value = [(VesselController::class)])
class VesselControllerITests {

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
        val gear = Gear()
        gear.gear = "OTB"
        gear.dimensions = "12;123"

        val farPastFixedDateTime = ZonedDateTime.of(EPOCH, LocalTime.MAX.plusSeconds(1), ZoneId.of("UTC"))
        val position =
            LastPosition(
                id = 0,
                vesselId = 1,
                internalReferenceNumber = "MMSI",
                mmsi = null,
                ircs = null,
                externalReferenceNumber = null,
                vesselName = null,
                flagState = CountryCode.FR,
                positionType = PositionType.AIS,
                latitude = 16.445,
                longitude = 48.2525,
                estimatedCurrentLatitude = 16.445,
                estimatedCurrentLongitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime = farPastFixedDateTime, vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                gearOnboard = listOf(
                    gear,
                ),
            )
        given(this.getLastPositions.execute()).willReturn(listOf(position))

        // When
        api.perform(get("/bff/v1/vessels"))
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
            .andExpect(jsonPath("$[0].reportings.length()", equalTo(0)))
            .andExpect(jsonPath("$[0].gearOnboard.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].gearOnboard[0].dimensions", equalTo("12;123")))
            .andExpect(jsonPath("$[0].alerts.length()", equalTo(0)))
    }

    private fun <T> givenSuspended(block: suspend () -> T) = given(runBlocking { block() })!!
    private infix fun <T> BDDMockito.BDDMyOngoingStubbing<T>.willReturn(block: () -> T) = willReturn(block())

    @Test
    fun `Should get vessels with last positions and risk factor`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                4,
            ),
        )
        val secondPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                3,
            ),
        )
        val thirdPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                2,
            ),
        )
        givenSuspended {
            getVessel.execute(eq(123), any(), any(), any(), any(), any(), eq(null), eq(null))
        } willReturn {
            Pair(
                false,
                VesselInformation(
                    vessel = Vessel(
                        id = 123,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                        underCharter = true,
                    ),
                    beacon = null,
                    positions = listOf(firstPosition, secondPosition, thirdPosition),
                    vesselRiskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                ),
            )
        }

        // When
        api.perform(
            get(
                "/bff/v1/vessels/find?vesselId=123&internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
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
            .andExpect(jsonPath("$.vessel.riskFactor.controlPriorityLevel", equalTo(1.0)))
            .andExpect(jsonPath("$.vessel.riskFactor.riskFactor", equalTo(3.2)))
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
    fun `Should return an Accepted header When the DEP message was not found`() {
        // Given
        givenSuspended {
            getVessel.execute(anyOrNull(), any(), any(), any(), any(), any(), eq(null), eq(null))
        } willReturn {
            Pair(
                true,
                VesselInformation(
                    vessel = null,
                    beacon = null,
                    positions = listOf(),
                    vesselRiskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                ),
            )
        }

        // When
        api.perform(
            get(
                "/bff/v1/vessels/find?vesselId=&internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
            ),
        )
            // Then
            .andExpect(status().isAccepted)
    }

    @Test
    fun `Should get vessels's last positions and data When from and to date parameters are set`() {
        // Given
        givenSuspended { getVessel.execute(anyOrNull(), any(), any(), any(), any(), any(), any(), any()) } willReturn {
            Pair(
                false,
                VesselInformation(
                    vessel = null,
                    beacon = null,
                    positions = listOf(),
                    vesselRiskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                ),
            )
        }

        // When
        api.perform(
            get(
                "/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123" +
                    "&IRCS=IEF4&trackDepth=CUSTOM&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&afterDateTime=2021-03-24T22:07:00.000Z&beforeDateTime=2021-04-24T22:07:00.000Z",
            ),
        )
            // Then
            .andExpect(status().isOk)

        runBlocking {
            Mockito.verify(getVessel).execute(
                vesselId = null,
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "123",
                ircs = "IEF4",
                trackDepth = VesselTrackDepth.CUSTOM,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                fromDateTime = ZonedDateTime.parse("2021-03-24T22:07:00Z"),
                toDateTime = ZonedDateTime.parse("2021-04-24T22:07:00Z"),
            )
        }
    }

    @Test
    fun `Should get vessels positions`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        val firstPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                4,
            ),
        )
        val secondPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                3,
            ),
        )
        val thirdPosition = Position(
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
            latitude = 16.445,
            longitude = 48.2525,
            speed = 1.8,
            course = 180.0,
            dateTime = now.minusHours(
                2,
            ),
        )
        givenSuspended {
            getVesselPositions.execute(any(), any(), any(), any(), any(), eq(null), eq(null))
        } willReturn {
            Pair(false, CompletableDeferred(listOf(firstPosition, secondPosition, thirdPosition)))
        }

        // When
        api.perform(
            get(
                "/bff/v1/vessels/positions?internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(3)))

        runBlocking {
            Mockito.verify(getVesselPositions).execute(
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
    fun `Should search for a vessel`() {
        // Given
        given(this.searchVessels.execute(any())).willReturn(
            listOf(
                VesselAndBeacon(
                    vessel = Vessel(
                        id = 1,
                        internalReferenceNumber = "FR224226850",
                        vesselName = "MY AWESOME VESSEL",
                        flagState = CountryCode.FR,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                    ),
                    beacon = Beacon(beaconNumber = "123456", vesselId = 1),
                ),
                VesselAndBeacon(
                    vessel = Vessel(
                        id = 2,
                        internalReferenceNumber = "GBR21555445",
                        vesselName = "ANOTHER VESSEL",
                        flagState = CountryCode.GB,
                        declaredFishingGears = listOf("Trémails"),
                        vesselType = "Fishing",
                    ),
                    beacon = null,
                ),
            ),
        )

        // When
        api.perform(get("/bff/v1/vessels/search?searched=VESSEL"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].flagState", equalTo("FR")))
            .andExpect(jsonPath("$[0].vesselName", equalTo("MY AWESOME VESSEL")))
            .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$[0].beaconNumber", equalTo("123456")))
            .andExpect(jsonPath("$[1].flagState", equalTo("GB")))
            .andExpect(jsonPath("$[1].vesselName", equalTo("ANOTHER VESSEL")))
            .andExpect(jsonPath("$[1].internalReferenceNumber", equalTo("GBR21555445")))

        Mockito.verify(searchVessels).execute("VESSEL")
    }

    @Test
    fun `Should find the last logbook messages of vessels`() {
        // Given
        val voyage = Voyage(
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
            get("/bff/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=LAST&beforeDateTime="),
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
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[0].messageType", equalTo("FAR")))
            .andExpect(
                jsonPath(
                    "$.logbookMessagesAndAlerts.logbookMessages[0].message.hauls[0].dimensions",
                    equalTo("150;120"),
                ),
            )
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].messageType", equalTo("DEP")))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].tripNumber", equalTo("345")))
            .andExpect(
                jsonPath(
                    "$.logbookMessagesAndAlerts.logbookMessages[1].reportDateTime",
                    equalTo("2020-05-04T03:04:05.000000003Z"),
                ),
            )

        Mockito.verify(getVesselVoyage).execute("FR224226850", VoyageRequest.LAST, null)
    }

    @Test
    fun `Should find the logbook messages of vessels before a specified date`() {
        // Given
        val voyage = Voyage(
            isLastVoyage = true,
            isFirstVoyage = false,
            startDate = ZonedDateTime.now().minusMonths(5),
            endDate = null,
            tripNumber = "1234",
            logbookMessagesAndAlerts = LogbookMessagesAndAlerts(TestUtils.getDummyLogbookMessages(), listOf()),
        )
        given(this.getVesselVoyage.execute(any(), any(), any())).willReturn(voyage)

        // When
        api.perform(
            get(
                "/bff/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=PREVIOUS&tripNumber=12345",
            ),
        )

        Mockito.verify(getVesselVoyage).execute(
            "FR224226850",
            VoyageRequest.PREVIOUS,
            "12345",
        )
    }

    @Test
    fun `Should get vessel's beacon malfunctions`() {
        // Given
        val now = ZonedDateTime.now().minusDays(1)
        given(
            this.getVesselBeaconMalfunctions.execute(
                eq(123),
                any(),
            ),
        )
            .willReturn(
                VesselBeaconMalfunctionsResumeAndHistory(
                    resume = VesselBeaconMalfunctionsResume(1, 2, null, null),
                    history = listOf(
                        BeaconMalfunctionWithDetails(
                            beaconMalfunction = BeaconMalfunction(
                                id = 1,
                                internalReferenceNumber = "FR224226850",
                                externalReferenceNumber = "1236514",
                                ircs = "IRCS",
                                flagState = "fr",
                                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                vesselName = "BIDUBULE",
                                vesselStatus = VesselStatus.AT_SEA,
                                stage = Stage.END_OF_MALFUNCTION,
                                malfunctionStartDateTime = ZonedDateTime.now(),
                                malfunctionEndDateTime = null,
                                vesselStatusLastModificationDateTime = ZonedDateTime.now(), endOfBeaconMalfunctionReason = EndOfBeaconMalfunctionReason.RESUMED_TRANSMISSION,
                                beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                            ),
                            comments = listOf(
                                BeaconMalfunctionComment(
                                    beaconMalfunctionId = 1,
                                    comment = "A comment",
                                    userType = BeaconMalfunctionCommentUserType.SIP,
                                    dateTime = now,
                                ),
                            ),
                            actions = listOf(
                                BeaconMalfunctionAction(
                                    beaconMalfunctionId = 1,
                                    propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                                    nextValue = "A VALUE",
                                    previousValue = "A VALUE",
                                    dateTime = now,
                                ),
                            ),
                        ),
                    ),
                    current = BeaconMalfunctionWithDetails(
                        beaconMalfunction = BeaconMalfunction(
                            id = 2,
                            internalReferenceNumber = "FR224226850",
                            externalReferenceNumber = "1236514",
                            ircs = "IRCS",
                            flagState = "fr",
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                            vesselName = "BIDUBULE",
                            vesselStatus = VesselStatus.AT_SEA,
                            stage = Stage.INITIAL_ENCOUNTER,
                            malfunctionStartDateTime = ZonedDateTime.now(),
                            malfunctionEndDateTime = null,
                            vesselStatusLastModificationDateTime = ZonedDateTime.now(),
                            beaconNumber = "123465", beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED, vesselId = 123,
                        ),
                        comments = listOf(
                            BeaconMalfunctionComment(
                                beaconMalfunctionId = 1,
                                comment = "A comment",
                                userType = BeaconMalfunctionCommentUserType.SIP,
                                dateTime = now,
                            ),
                        ),
                        actions = listOf(
                            BeaconMalfunctionAction(
                                beaconMalfunctionId = 1,
                                propertyName = BeaconMalfunctionActionPropertyName.VESSEL_STATUS,
                                nextValue = "A VALUE",
                                previousValue = "A VALUE",
                                dateTime = now,
                            ),
                        ),
                    ),
                ),
            )

        // When
        api.perform(
            get(
                "/bff/v1/vessels/beacon_malfunctions?vesselId=123&afterDateTime=2021-03-24T22:07:00.000Z",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.resume.numberOfBeaconsAtSea", equalTo(1)))
            .andExpect(jsonPath("$.resume.numberOfBeaconsAtPort", equalTo(2)))
            .andExpect(jsonPath("$.current.beaconMalfunction.id", equalTo(2)))
            .andExpect(jsonPath("$.current.beaconMalfunction.vesselId", equalTo(123)))
            .andExpect(jsonPath("$.current.beaconMalfunction.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.current.beaconMalfunction.externalReferenceNumber", equalTo("1236514")))
            .andExpect(jsonPath("$.history[0].beaconMalfunction.id", equalTo(1)))
            .andExpect(jsonPath("$.history[0].beaconMalfunction.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.history[0].beaconMalfunction.flagState", equalTo("fr")))
            .andExpect(jsonPath("$.history[0].beaconMalfunction.externalReferenceNumber", equalTo("1236514")))
            .andExpect(
                jsonPath(
                    "$.history[0].beaconMalfunction.endOfBeaconMalfunctionReason",
                    equalTo("RESUMED_TRANSMISSION"),
                ),
            )
            .andExpect(jsonPath("$.history[0].actions[0].beaconMalfunctionId", equalTo(1)))
            .andExpect(jsonPath("$.history[0].actions[0].propertyName", equalTo("VESSEL_STATUS")))
            .andExpect(jsonPath("$.history[0].comments[0].beaconMalfunctionId", equalTo(1)))
            .andExpect(jsonPath("$.history[0].comments[0].comment", equalTo("A comment")))
    }

    @Test
    fun `Should get vessel's reporting`() {
        // Given
        val currentReportingAndControlUnit = Pair(
            Reporting(
                id = 1,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = ThreeMilesTrawlingAlert() as ReportingValue,
                isArchived = false,
                isDeleted = false,
                infraction = Infraction(
                    natinfCode = 7059,
                    infractionCategory = InfractionCategory.FISHING,
                ),
            ),
            null,
        )
        val archivedReportingAndControlUnit = Pair(
            Reporting(
                id = 666,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now().minusYears(1),
                validationDate = ZonedDateTime.now().minusYears(1),
                value = ThreeMilesTrawlingAlert() as ReportingValue,
                isArchived = true,
                isDeleted = false,
            ),
            null,
        )

        given(
            this.getVesselReportings.execute(
                eq(123456),
                eq("FR224226850"),
                eq("123"),
                eq("IEF4"),
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                any(),
            ),
        )
            .willReturn(
                CurrentAndArchivedReportings(
                    current = listOf(currentReportingAndControlUnit, currentReportingAndControlUnit),
                    archived = listOf(archivedReportingAndControlUnit),
                ),
            )

        // When
        api.perform(
            get(
                "/bff/v1/vessels/reporting?vesselId=123456&internalReferenceNumber=FR224226850" +
                    "&externalReferenceNumber=123&IRCS=IEF4&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&fromDate=2021-03-24T22:07:00.000Z",
            ),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.current.length()", equalTo(2)))
            .andExpect(jsonPath("$.current[0].id", equalTo(1)))
            .andExpect(jsonPath("$.current[0].flagState", equalTo("FR")))
            .andExpect(jsonPath("$.current[0].internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.current[0].externalReferenceNumber", equalTo("1236514")))
            .andExpect(jsonPath("$.current[0].type", equalTo("ALERT")))
            .andExpect(jsonPath("$.current[0].isArchived", equalTo(false)))
            .andExpect(jsonPath("$.current[0].isDeleted", equalTo(false)))
            .andExpect(jsonPath("$.current[0].infraction.natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$.current[0].value.type", equalTo("THREE_MILES_TRAWLING_ALERT")))
            .andExpect(jsonPath("$.current[0].value.natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$.archived[0].id", equalTo(666)))
            .andExpect(jsonPath("$.archived[0].internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.archived[0].externalReferenceNumber", equalTo("1236514")))
            .andExpect(jsonPath("$.archived[0].type", equalTo("ALERT")))
            .andExpect(jsonPath("$.archived[0].isArchived", equalTo(true)))
            .andExpect(jsonPath("$.archived[0].isDeleted", equalTo(false)))
    }

    @Test
    fun `Should get vessel's reporting with an empty vessel id`() {
        given(
            this.getVesselReportings.execute(
                eq(null),
                eq("FR224226850"),
                eq("123"),
                eq("IEF4"),
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                any(),
            ),
        )
            .willReturn(
                CurrentAndArchivedReportings(
                    current = listOf(),
                    archived = listOf(),
                ),
            )

        // When
        api.perform(
            get(
                "/bff/v1/vessels/reporting?vesselId=&internalReferenceNumber=FR224226850" +
                    "&externalReferenceNumber=123&IRCS=IEF4&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&fromDate=2021-03-24T22:07:00.000Z",
            ),
        )
            // Then
            .andExpect(status().isOk)

        Mockito.verify(getVesselReportings).execute(
            eq(null),
            eq("FR224226850"),
            eq("123"),
            eq("IEF4"),
            eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
            any(),
        )
    }

    @Test
    fun `Should get the risk factor of a vessel`() {
        // Given
        given(this.getVesselRiskFactor.execute(any())).willReturn(
            VesselRiskFactor(segments = listOf("SWW10")),
        )

        // When
        api.perform(get("/bff/v1/vessels/risk_factor?internalReferenceNumber=FR224226850"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.impactRiskFactor", equalTo(1.0)))
            .andExpect(jsonPath("$.segments", equalTo(listOf("SWW10"))))

        Mockito.verify(getVesselRiskFactor).execute("FR224226850")
    }

    @Test
    fun `Should get a 404 When the risk factor is not found`() {
        // Given
        given(this.getVesselRiskFactor.execute(any())).willThrow(IllegalArgumentException("Not found"))

        // When
        api.perform(get("/bff/v1/vessels/risk_factor?internalReferenceNumber=FR224226850"))
            // Then
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `Should find the last logbook trip numbers of a given vessels`() {
        // Given
        given(this.getVesselLastTripNumbers.execute(any())).willReturn(listOf("2020000125", "2020000126", "2020000127"))

        // When
        api.perform(
            get("/bff/v1/vessels/logbook/last?internalReferenceNumber=FR224226850"),
        )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(3)))
            .andExpect(jsonPath("$[0]", equalTo("2020000125")))
    }
}
