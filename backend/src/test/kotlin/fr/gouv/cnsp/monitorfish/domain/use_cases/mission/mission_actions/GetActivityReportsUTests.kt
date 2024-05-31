package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.TestUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment as FullFleetSegment

@ExtendWith(SpringExtension::class)
class GetActivityReportsUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @MockBean
    private lateinit var missionRepository: MissionRepository

    @Test
    fun `execute Should filter controls done in two fao areas When the first JDP found for this control is NORTH_SEA`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.7.b", "27.4.c"),
                segments = listOf(
                    FleetSegment("NWW01/02", "Trawl"),
                    FleetSegment("NS01/03", "North sea"),
                ),
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(species),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                faoAreas = listOf("27.7.b", "27.4.c"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 3,
                vesselId = 2,
                missionId = 3,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                faoAreas = listOf("27.7.b", "27.4.c"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = true,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(listOf(1, 2, 3))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.WESTERN_WATERS,
        )

        // Then
        assertThat(activityReports.jdpSpecies).hasSize(35)
        assertThat(activityReports.activityReports).hasSize(0)
    }

    @Test
    fun `execute Should include a control done in two fao areas as the first JDP found for this control is NORTH_SEA`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.7.b", "27.4.c"),
                segments = listOf(
                    FleetSegment("NWW01/02", "Trawl"),
                    FleetSegment("NS01/03", "North sea"),
                ),
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(species),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                faoAreas = listOf("27.7.b", "27.4.c"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
            MissionAction(
                id = 3,
                vesselId = 2,
                missionId = 3,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                faoAreas = listOf("27.7.b", "27.4.c"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = true,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(listOf(1, 2, 3))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.jdpSpecies).hasSize(38)
        assertThat(activityReports.activityReports).hasSize(1)

        activityReports.activityReports.first().let { seaReport ->
            assertThat(seaReport.activityCode).isEqualTo(ActivityCode.FIS)
            assertThat(seaReport.vesselNationalIdentifier).isEqualTo("AYFR00022680")
            assertThat(seaReport.faoArea).isEqualTo("27.4.c")
            assertThat(seaReport.segment).isNull()
        }
    }

    @Test
    fun `execute Should add the fao area for a LAND control`() {
        // Given
        val species = SpeciesControl()
        species.speciesCode = "HKE"

        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            listOf(
                FullFleetSegment(
                    "NS01/03",
                    "Otter trawls/Seines",
                    gears = listOf("OTB", "OTT", "TBN", "PTB", "SDN", "SSC", "SPR", "OT", "TBS", "OTM", "PTM", "TMS", "TM", "TX", "TB", "SX", "SV"),
                    targetSpecies = listOf("COD", "HAD", "WHG", "POK", "SOL", "PLE", "NEP", "HKE"),
                    faoAreas = listOf("27.2.a", "27.4.a", "27.4.b", "27.4.c"),
                    year = ZonedDateTime.now().year,
                    impactRiskFactor = 2.56,
                ),
            ),
        )

        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.4.a"),
                segments = listOf(
                    FleetSegment("NS01/03", "North Sea"),
                ),
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(species),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(eq(listOf(1)))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.activityReports).hasSize(1)

        activityReports.activityReports.first().let { landReport ->
            assertThat(landReport.activityCode).isEqualTo(ActivityCode.LAN)
            assertThat(landReport.action.portName).isEqualTo("Al Jazeera Port")
            assertThat(landReport.faoArea).isEqualTo("27.4.a")
            assertThat(landReport.segment).isNull()
        }
    }

    @Test
    fun `execute Should filter a control done outside the JDP FAO area`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                // These fao areas are outside WESTERN WATERS
                faoAreas = listOf("27.4.c", "27.4.b"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = true,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(listOf(2))).willReturn(missions)

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.WESTERN_WATERS,
        )

        // Then
        assertThat(activityReports.activityReports).hasSize(0)
    }

    @Test
    fun `execute Should include a control done within the JDP FAO area`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                // The first fao area "27.7.c" is within WESTERN_WATERS
                // The second fao area "27.4.b" is within NORTH_SEA
                faoAreas = listOf("27.7.c", "27.4.b"),
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = true,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(listOf(2))).willReturn(missions)

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.activityReports).hasSize(1)
    }

    @Test
    fun `execute Should not throw When a SEA mission is not found in the mission repository`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.4.b", "27.4.c"),
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(species),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 2,
                vesselId = 1,
                missionId = 2,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 3,
                vesselId = 2,
                missionId = 3,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                3,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        // The mission id 2 is not returned
        given(missionRepository.findByIds(listOf(1, 2, 3))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.jdpSpecies).hasSize(38)
        assertThat(activityReports.activityReports).hasSize(1)
        val landReport = activityReports.activityReports.first()
        assertThat(landReport.activityCode).isEqualTo(ActivityCode.LAN)
        assertThat(landReport.action.portName).isEqualTo("Al Jazeera Port")
    }

    @Test
    fun `execute Should not throw When a LAND mission is not found in the mission repository`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(any())).willReturn(
            TestUtils.getDummyFleetSegments(),
        )

        val species = SpeciesControl()
        species.speciesCode = "HKE"

        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.4.b", "27.4.c"),
                actionType = MissionActionType.LAND_CONTROL,
                gearOnboard = listOf(),
                speciesOnboard = listOf(species),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
            MissionAction(
                id = 3,
                vesselId = 2,
                missionId = 3,
                actionDatetimeUtc = ZonedDateTime.now(),
                actionType = MissionActionType.SEA_CONTROL,
                seizureAndDiversion = false,
                speciesInfractions = listOf(),
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                flagState = CountryCode.FR,
                userTrigram = "LTH",
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                3,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        // The mission id 1 is not returned
        given(missionRepository.findByIds(listOf(1, 3))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.activityReports).hasSize(0)
    }

    @Test
    fun `execute Should filter a control done by an AECP unit`() {
        // Given
        val controls = listOf(
            MissionAction(
                id = 1,
                vesselId = 1,
                missionId = 1,
                actionDatetimeUtc = ZonedDateTime.now(),
                portLocode = "AEFAT",
                faoAreas = listOf("27.4.b", "27.4.c"),
                actionType = MissionActionType.SEA_CONTROL,
                gearOnboard = listOf(),
                controlUnits = listOf(),
                speciesOnboard = listOf(),
                seizureAndDiversion = true,
                isDeleted = false,
                hasSomeGearsSeized = false,
                hasSomeSpeciesSeized = false,
                isFromPoseidon = false,
                completion = Completion.TO_COMPLETE,
                flagState = CountryCode.FR,
                userTrigram = "CPAMOI",
            ),
        )
        given(missionActionsRepository.findSeaAndLandControlBetweenDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isUnderJdp = true,
                controlUnits = listOf(ControlUnit(123, "AECP", false, "Unit AECP", listOf())),
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),

        )
        // The mission id 2 is not returned
        given(missionRepository.findByIds(listOf(1))).willReturn(missions)
        given(portRepository.findByLocode(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

        // When
        val activityReports = GetActivityReports(
            missionActionsRepository,
            portRepository,
            vesselRepository,
            missionRepository,
        ).execute(
            ZonedDateTime.now(),
            ZonedDateTime.now().minusDays(1),
            JointDeploymentPlan.NORTH_SEA,
        )

        // Then
        assertThat(activityReports.jdpSpecies).hasSize(38)
        assertThat(activityReports.activityReports).hasSize(0)
    }
}
