package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
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
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.VoyageRequest
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetVesselReportings
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_VESSEL_PROFILE
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.utils.ApiTestWithJWTSecurity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito
import org.mockito.BDDMockito.given
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate.EPOCH
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

@ApiTestWithJWTSecurity(value = [(VesselController::class)])
@Import(MapperConfiguration::class)
class VesselControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var getActiveVessels: GetActiveVessels

    @MockBean
    private lateinit var getVessel: GetVessel

    @MockBean
    private lateinit var getVesselById: GetVesselById

    @MockBean
    private lateinit var getVesselPositions: GetVesselPositions

    @MockBean
    private lateinit var getVesselVoyage: GetVesselVoyage

    @MockBean
    private lateinit var getVesselVoyageByDates: GetVesselVoyageByDates

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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
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
                dateTime = farPastFixedDateTime,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                gearOnboard =
                    listOf(
                        gear,
                    ),
            )
        given(this.getActiveVessels.execute(any())).willReturn(
            listOf(
                EnrichedActiveVessel(
                    lastPosition = position,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(),
                    vesselGroups = listOf(),
                ),
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/vessels")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].vesselId", equalTo(position.vesselId)))
            .andExpect(jsonPath("$[0].internalReferenceNumber", equalTo(position.internalReferenceNumber)))
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
            .andExpect(jsonPath("$[0].gearsArray.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].gearsArray[0]", equalTo("OTB")))
            .andExpect(jsonPath("$[0].alerts.length()", equalTo(0)))
    }

    private fun <T> givenSuspended(block: suspend () -> T) = given(runBlocking { block() })!!

    private infix fun <T> BDDMockito.BDDMyOngoingStubbing<T>.willReturn(block: () -> T) = willReturn(block())

    @Test
    fun `Should get vessel with last positions and vessel data`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        givenSuspended {
            getVessel.execute(
                userEmail = eq("email@domain-name.com"),
                vesselId = eq(123),
                internalReferenceNumber = any(),
                externalReferenceNumber = any(),
                ircs = any(),
                trackDepth = any(),
                vesselIdentifier = any(),
                fromDateTime = eq(null),
                toDateTime = eq(null),
            )
        } willReturn {
            Pair(
                false,
                EnrichedActiveVesselWithPositions(
                    enrichedActiveVessel =
                        EnrichedActiveVessel(
                            vessel =
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
                            riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                            producerOrganization =
                                ProducerOrganizationMembership(
                                    internalReferenceNumber = "FR224226850",
                                    "01/10/2024",
                                    "OP",
                                ),
                            vesselProfile = DUMMY_VESSEL_PROFILE,
                            vesselGroups = getDynamicVesselGroups(),
                            beacon = null,
                            lastPosition = null,
                        ),
                    positions = listOf(firstPosition, secondPosition, thirdPosition),
                ),
            )
        }

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/find?vesselId=123&internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.vessel.declaredFishingGears[0]", equalTo("Trémails")))
            .andExpect(jsonPath("$.vessel.vesselType", equalTo("Fishing")))
            .andExpect(jsonPath("$.vessel.flagState", equalTo("FR")))
            .andExpect(jsonPath("$.vessel.vesselName", equalTo("MY AWESOME VESSEL")))
            .andExpect(jsonPath("$.vessel.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.positions.length()", equalTo(3)))
            .andExpect(jsonPath("$.vessel.riskFactor.controlPriorityLevel", equalTo(0.25)))
            .andExpect(jsonPath("$.vessel.riskFactor.riskFactor", equalTo(1.74)))
            .andExpect(jsonPath("$.vessel.underCharter", equalTo(true)))
            .andExpect(jsonPath("$.vessel.producerOrganization.organizationName", equalTo("OP")))
            .andExpect(
                jsonPath(
                    "$.vessel.profile.species['ANF']",
                    equalTo(BigDecimal(0.15138120208784955).setScale(17, RoundingMode.HALF_UP)),
                ),
            ).andExpect(jsonPath("$.vessel.groups[0].name", equalTo("Mission Thémis – chaluts de fonds")))

        runBlocking {
            Mockito.verify(getVessel).execute(
                userEmail = "email@domain-name.com",
                vesselId = 123,
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "123",
                ircs = "IEF4",
                trackDepth = VesselTrackDepth.TWELVE_HOURS,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                fromDateTime = null,
                toDateTime = null,
            )
        }
    }

    @Test
    fun `Should return an Accepted header When the DEP message was not found`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        givenSuspended {
            getVessel.execute(
                userEmail = any(),
                vesselId = anyOrNull(),
                internalReferenceNumber = any(),
                externalReferenceNumber = any(),
                ircs = any(),
                trackDepth = any(),
                vesselIdentifier = any(),
                fromDateTime = eq(null),
                toDateTime = eq(null),
            )
        } willReturn {
            Pair(
                true,
                EnrichedActiveVesselWithPositions(
                    enrichedActiveVessel =
                        EnrichedActiveVessel(
                            vessel = null,
                            beacon = null,
                            riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                            producerOrganization = null,
                            vesselProfile = null,
                            vesselGroups = listOf(),
                            lastPosition = null,
                        ),
                    positions = listOf(),
                ),
            )
        }

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/find?vesselId=&internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isAccepted)
    }

    @Test
    fun `Should get vessels's last positions and data When from and to date parameters are set`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        givenSuspended {
            getVessel.execute(
                userEmail = any(),
                vesselId = anyOrNull(),
                internalReferenceNumber = any(),
                externalReferenceNumber = any(),
                ircs = any(),
                trackDepth = any(),
                vesselIdentifier = any(),
                fromDateTime = any(),
                toDateTime = any(),
            )
        } willReturn {
            Pair(
                false,
                EnrichedActiveVesselWithPositions(
                    enrichedActiveVessel =
                        EnrichedActiveVessel(
                            vessel = null,
                            beacon = null,
                            riskFactor = VesselRiskFactor(2.3, 2.0, 1.9, 3.2),
                            producerOrganization = null,
                            vesselProfile = null,
                            vesselGroups = listOf(),
                            lastPosition = null,
                        ),
                    positions = listOf(),
                ),
            )
        }

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/find?internalReferenceNumber=FR224226850&externalReferenceNumber=123" +
                        "&IRCS=IEF4&trackDepth=CUSTOM&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&afterDateTime=2021-03-24T22:07:00.000Z&beforeDateTime=2021-04-24T22:07:00.000Z",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)

        runBlocking {
            Mockito.verify(getVessel).execute(
                userEmail = "email@domain-name.com",
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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        3,
                    ),
            )
        val thirdPosition =
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
                latitude = 16.445,
                longitude = 48.2525,
                speed = 1.8,
                course = 180.0,
                dateTime =
                    now.minusHours(
                        2,
                    ),
            )
        givenSuspended {
            getVesselPositions.execute(any(), any(), any(), any(), any(), eq(null), eq(null))
        } willReturn {
            Pair(false, CompletableDeferred(listOf(firstPosition, secondPosition, thirdPosition)))
        }

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/positions?internalReferenceNumber=FR224226850&externalReferenceNumber=123&IRCS=IEF4&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(this.searchVessels.execute(any())).willReturn(
            listOf(
                VesselAndBeacon(
                    vessel =
                        Vessel(
                            id = 1,
                            internalReferenceNumber = "FR224226850",
                            vesselName = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            declaredFishingGears = listOf("Trémails"),
                            vesselType = "Fishing",
                            hasLogbookEsacapt = false,
                        ),
                    beacon = Beacon(beaconNumber = "123456", vesselId = 1),
                ),
                VesselAndBeacon(
                    vessel =
                        Vessel(
                            id = 2,
                            internalReferenceNumber = "GBR21555445",
                            vesselName = "ANOTHER VESSEL",
                            flagState = CountryCode.GB,
                            declaredFishingGears = listOf("Trémails"),
                            vesselType = "Fishing",
                            hasLogbookEsacapt = false,
                        ),
                    beacon = null,
                ),
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/vessels/search?searched=VESSEL")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val voyage =
            Voyage(
                isLastVoyage = true,
                isFirstVoyage = false,
                startDate = ZonedDateTime.parse("2021-01-21T10:21:26.617301+01:00"),
                endDate = null,
                tripNumber = "1234",
                software = "FT/",
                logbookMessagesAndAlerts = LogbookMessagesAndAlerts(TestUtils.getDummyLogbookMessages(), listOf()),
            )
        given(this.getVesselVoyage.execute(any(), any(), anyOrNull())).willReturn(voyage)

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=LAST&beforeDateTime=",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
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
            ).andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[1].messageType", equalTo("DEP")))
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
    fun `getVesselVoyage() Should return NOT_FOUND When not found`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(
            this.getVesselVoyage.execute(any(), any(), any()),
        ).willThrow(BackendUsageException(BackendUsageErrorCode.NOT_FOUND_BUT_OK))

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=PREVIOUS&tripNumber=12345",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code", equalTo("NOT_FOUND_BUT_OK")))
    }

    @Test
    fun `Should find the logbook messages of vessels before a specified date`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val voyage =
            Voyage(
                isLastVoyage = true,
                isFirstVoyage = false,
                startDate = ZonedDateTime.now().minusMonths(5),
                endDate = null,
                tripNumber = "1234",
                software = "FT/",
                logbookMessagesAndAlerts = LogbookMessagesAndAlerts(TestUtils.getDummyLogbookMessages(), listOf()),
            )
        given(this.getVesselVoyage.execute(any(), any(), any())).willReturn(voyage)

        // When
        api.perform(
            get(
                "/bff/v1/vessels/logbook/find?internalReferenceNumber=FR224226850&voyageRequest=PREVIOUS&tripNumber=12345",
            ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val now = ZonedDateTime.now().minusDays(1)
        given(
            this.getVesselBeaconMalfunctions.execute(
                eq(123),
                any(),
            ),
        ).willReturn(
            VesselBeaconMalfunctionsResumeAndHistory(
                resume = VesselBeaconMalfunctionsResume(1, 2, null, null),
                history =
                    listOf(
                        BeaconMalfunctionWithDetails(
                            beaconMalfunction =
                                BeaconMalfunction(
                                    id = 1,
                                    internalReferenceNumber = "FR224226850",
                                    externalReferenceNumber = "1236514",
                                    ircs = "IRCS",
                                    flagState = "fr",
                                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                                    vesselName = "BIDUBULE",
                                    vesselStatus = VesselStatus.AT_SEA,
                                    stage = Stage.ARCHIVED,
                                    malfunctionStartDateTime = ZonedDateTime.now(),
                                    malfunctionEndDateTime = null,
                                    vesselStatusLastModificationDateTime = ZonedDateTime.now(),
                                    endOfBeaconMalfunctionReason = EndOfBeaconMalfunctionReason.RESUMED_TRANSMISSION,
                                    beaconNumber = "123465",
                                    beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                                    vesselId = 123,
                                ),
                            comments =
                                listOf(
                                    BeaconMalfunctionComment(
                                        beaconMalfunctionId = 1,
                                        comment = "A comment",
                                        userType = BeaconMalfunctionCommentUserType.SIP,
                                        dateTime = now,
                                    ),
                                ),
                            actions =
                                listOf(
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
                current =
                    BeaconMalfunctionWithDetails(
                        beaconMalfunction =
                            BeaconMalfunction(
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
                                beaconNumber = "123465",
                                beaconStatusAtMalfunctionCreation = BeaconStatus.ACTIVATED,
                                vesselId = 123,
                            ),
                        comments =
                            listOf(
                                BeaconMalfunctionComment(
                                    beaconMalfunctionId = 1,
                                    comment = "A comment",
                                    userType = BeaconMalfunctionCommentUserType.SIP,
                                    dateTime = now,
                                ),
                            ),
                        actions =
                            listOf(
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
        api
            .perform(
                get(
                    "/bff/v1/vessels/beacon_malfunctions?vesselId=123&afterDateTime=2021-03-24T22:07:00.000Z",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
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
            ).andExpect(jsonPath("$.history[0].actions[0].beaconMalfunctionId", equalTo(1)))
            .andExpect(jsonPath("$.history[0].actions[0].propertyName", equalTo("VESSEL_STATUS")))
            .andExpect(jsonPath("$.history[0].comments[0].beaconMalfunctionId", equalTo(1)))
            .andExpect(jsonPath("$.history[0].comments[0].comment", equalTo("A comment")))
    }

    @Test
    fun `Should get vessel's reportings by vessel identity with vessel ID`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val currentReporting =
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
                infraction =
                    Infraction(
                        natinfCode = 7059,
                        infractionCategory = InfractionCategory.FISHING,
                    ),
            )

        val archivedReporting =
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
        ).willReturn(
            VesselReportings(
                summary =
                    ReportingTwelveMonthsSummary(
                        infractionSuspicionsSummary =
                            listOf(
                                ReportingTitleAndNumberOfOccurrences(
                                    title = "A title",
                                    numberOfOccurrences = 2,
                                ),
                                ReportingTitleAndNumberOfOccurrences(
                                    title = "A title",
                                    numberOfOccurrences = 2,
                                ),
                            ),
                        numberOfInfractionSuspicions = 4,
                        numberOfObservations = 5,
                    ),
                current =
                    listOf(
                        ReportingAndOccurrences(
                            otherOccurrencesOfSameAlert = listOf(),
                            reporting = currentReporting,
                            controlUnit = null,
                        ),
                        ReportingAndOccurrences(
                            otherOccurrencesOfSameAlert = listOf(),
                            reporting = currentReporting,
                            controlUnit = null,
                        ),
                    ),
                archived =
                    mapOf(
                        2024 to
                            listOf(
                                ReportingAndOccurrences(
                                    otherOccurrencesOfSameAlert = listOf(),
                                    reporting = archivedReporting,
                                    controlUnit = null,
                                ),
                            ),
                        2023 to emptyList(),
                        2022 to emptyList(),
                        2021 to emptyList(),
                    ),
            ),
        )

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/reportings?vesselId=123456&internalReferenceNumber=FR224226850" +
                        "&externalReferenceNumber=123&ircs=IEF4&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&fromDate=2021-03-24T22:07:00.000Z",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.current.length()", equalTo(2)))
            .andExpect(jsonPath("$.current[0].reporting.id", equalTo(1)))
            .andExpect(jsonPath("$.summary.numberOfInfractionSuspicions", equalTo(4)))
            .andExpect(jsonPath("$.summary.infractionSuspicionsSummary[0].title", equalTo("A title")))
            .andExpect(jsonPath("$.summary.infractionSuspicionsSummary[0].numberOfOccurrences", equalTo(2)))
            .andExpect(jsonPath("$.current[0].reporting.flagState", equalTo("FR")))
            .andExpect(jsonPath("$.current[0].reporting.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.current[0].reporting.externalReferenceNumber", equalTo("1236514")))
            .andExpect(jsonPath("$.current[0].reporting.type", equalTo("ALERT")))
            .andExpect(jsonPath("$.current[0].reporting.isArchived", equalTo(false)))
            .andExpect(jsonPath("$.current[0].reporting.isDeleted", equalTo(false)))
            .andExpect(jsonPath("$.current[0].reporting.infraction.natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$.current[0].reporting.value.type", equalTo("THREE_MILES_TRAWLING_ALERT")))
            .andExpect(jsonPath("$.current[0].reporting.value.natinfCode", equalTo(7059)))
            .andExpect(jsonPath("$.archived.2024[0].reporting.id", equalTo(666)))
            .andExpect(jsonPath("$.archived.2024[0].reporting.internalReferenceNumber", equalTo("FR224226850")))
            .andExpect(jsonPath("$.archived.2024[0].reporting.externalReferenceNumber", equalTo("1236514")))
            .andExpect(jsonPath("$.archived.2024[0].reporting.type", equalTo("ALERT")))
            .andExpect(jsonPath("$.archived.2024[0].reporting.isArchived", equalTo(true)))
            .andExpect(jsonPath("$.archived.2024[0].reporting.isDeleted", equalTo(false)))
    }

    @Test
    fun `Should get vessel's reporting by vessel identity without vessel ID`() {
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(
            this.getVesselReportings.execute(
                eq(null),
                eq("FR224226850"),
                eq("123"),
                eq("IEF4"),
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                any(),
            ),
        ).willReturn(
            VesselReportings(
                summary =
                    ReportingTwelveMonthsSummary(
                        infractionSuspicionsSummary = listOf(),
                        numberOfInfractionSuspicions = 0,
                        numberOfObservations = 0,
                    ),
                current = listOf(),
                archived = mapOf(),
            ),
        )

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/reportings?vesselId=&internalReferenceNumber=FR224226850" +
                        "&externalReferenceNumber=123&ircs=IEF4&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&fromDate=2021-03-24T22:07:00.000Z",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
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
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(this.getVesselRiskFactor.execute(any())).willReturn(
            VesselRiskFactor(segments = listOf("SWW10")),
        )

        // When
        api
            .perform(
                get("/bff/v1/vessels/risk_factor?internalReferenceNumber=FR224226850")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.impactRiskFactor", equalTo(1.0)))
            .andExpect(jsonPath("$.segments", equalTo(listOf("SWW10"))))

        Mockito.verify(getVesselRiskFactor).execute("FR224226850")
    }

    @Test
    fun `Should get a 404 When the risk factor is not found`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(this.getVesselRiskFactor.execute(any())).willThrow(IllegalArgumentException("Not found"))

        // When
        api
            .perform(
                get("/bff/v1/vessels/risk_factor?internalReferenceNumber=FR224226850")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `Should find the last logbook trip numbers of a given vessels`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(this.getVesselLastTripNumbers.execute(any())).willReturn(listOf("2020000125", "2020000126", "2020000127"))

        // When
        api
            .perform(
                get("/bff/v1/vessels/logbook/last?internalReferenceNumber=FR224226850")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(3)))
            .andExpect(jsonPath("$[0]", equalTo("2020000125")))
    }

    @Test
    fun `Should find logbook messages of a vessel by dates`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val voyage =
            Voyage(
                isLastVoyage = true,
                isFirstVoyage = false,
                startDate = ZonedDateTime.parse("2021-01-21T10:21:26.617301+01:00"),
                endDate = null,
                tripNumber = "1234",
                software = "FT/",
                logbookMessagesAndAlerts = LogbookMessagesAndAlerts(TestUtils.getDummyLogbookMessages(), listOf()),
            )
        given(this.getVesselVoyageByDates.execute(any(), any(), anyOrNull(), anyOrNull())).willReturn(voyage)

        // When
        api
            .perform(
                get(
                    "/bff/v1/vessels/logbook/find_by_dates?internalReferenceNumber=FR224226850&trackDepth=TWO_DAYS&beforeDateTime=&afterDateTime=",
                ).header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isLastVoyage", equalTo(true)))
            .andExpect(jsonPath("$.tripNumber", equalTo("1234")))
            .andExpect(jsonPath("$.isFirstVoyage", equalTo(false)))
            .andExpect(jsonPath("$.startDate", equalTo("2021-01-21T10:21:26.617301+01:00")))
            .andExpect(jsonPath("$.endDate", equalTo(null)))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages.length()", equalTo(6)))
            .andExpect(jsonPath("$.logbookMessagesAndAlerts.logbookMessages[0].messageType", equalTo("FAR")))

        Mockito.verify(getVesselVoyageByDates).execute("FR224226850", VesselTrackDepth.TWO_DAYS, null, null)
    }
}
