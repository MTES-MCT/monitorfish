package fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionSource
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.ActivityCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep.JointDeploymentPlan
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetActivityReportsUTests {

    @MockBean
    private lateinit var missionActionsRepository: MissionActionsRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var missionRepository: MissionRepository

    @Test
    fun `execute Should return the activity report of a JDP control`() {
        // Given
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
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findControlsInDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = true,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                2,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        given(missionRepository.findByIds(listOf(1, 2, 3))).willReturn(missions)
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

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
        assertThat(activityReports.activityReports).hasSize(2)
        val landReport = activityReports.activityReports.first()
        assertThat(landReport.activityCode).isEqualTo(ActivityCode.LAN)
        assertThat(landReport.action.portName).isEqualTo("Al Jazeera Port")
        val seaReport = activityReports.activityReports.last()
        assertThat(seaReport.activityCode).isEqualTo(ActivityCode.FIS)
        assertThat(landReport.vesselNationalIdentifier).isEqualTo("AYFR00022680")
    }

    @Test
    fun `execute Should not throw When a SEA mission is not found in the mission repository`() {
        // Given
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
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findControlsInDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                1,
                missionTypes = listOf(MissionType.LAND),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
            Mission(
                3,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        // The mission id 2 is not returned
        given(missionRepository.findByIds(listOf(1, 2, 3))).willReturn(missions)
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

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
                completion = Completion.TO_COMPLETE,
            ),
        )
        given(missionActionsRepository.findControlsInDates(any(), any())).willReturn(controls)

        val vessels = listOf(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
            ),
            Vessel(
                id = 2,
                internalReferenceNumber = "FR00065455",
                vesselName = "MY SECOND AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "LO",
            ),
        )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(vessels)

        val missions = listOf(
            Mission(
                3,
                missionTypes = listOf(MissionType.SEA),
                missionSource = MissionSource.MONITORFISH,
                isClosed = false,
                isUnderJdp = false,
                isGeometryComputedFromControls = false,
                startDateTimeUtc = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, ZoneOffset.UTC),
            ),
        )
        // The mission id 1 is not returned
        given(missionRepository.findByIds(listOf(1, 3))).willReturn(missions)
        given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port"))

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
}
