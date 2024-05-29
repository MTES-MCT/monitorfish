package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class JointDeploymentPlanUTests {
    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `isLandControlApplicable Should return true When a targeted specy and fao code are contained in the control`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.4.b", "27.4.c"),
            seizureAndDiversion = false,
            speciesOnboard = getSpecies(listOf("HKE", "ANN", "BOR")),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val isLandControlApplicable = jdp.isLandControlApplicable(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.NORTH_SEA -> assertThat(isLandControlApplicable).isTrue()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(isLandControlApplicable).isFalse()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `isLandControlApplicable Should return false When a targeted specy is not contained in the control`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.4.b", "27.4.c"),
            seizureAndDiversion = false,
            // The HKE specy is missing
            speciesOnboard = getSpecies(listOf("ANN", "BOR")),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val isLandControlApplicable = jdp.isLandControlApplicable(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.NORTH_SEA -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(isLandControlApplicable).isFalse()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `isLandControlApplicable Should return false When a targeted fao code is not contained in the control`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            // The "27.4" fao code is missing
            faoAreas = listOf("27.5.b", "27.5.c"),
            seizureAndDiversion = false,
            speciesOnboard = getSpecies(listOf("HKE", "ANN", "BOR")),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val isLandControlApplicable = jdp.isLandControlApplicable(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.NORTH_SEA -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(isLandControlApplicable).isFalse()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `isLandControlApplicable Should return true When a third country vessel has species in the EU quota list`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.5.b", "27.5.c"),
            seizureAndDiversion = false,
            // ALB is contained in the quotas
            speciesOnboard = getSpecies(listOf("HKE", "ANN", "BOR", "ALB")),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.GB,
            userTrigram = "LTH"
        )

        // When
        val isLandControlApplicable = jdp.isLandControlApplicable(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.NORTH_SEA -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(isLandControlApplicable).isTrue()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `isLandControlApplicable Should return false When a third country vessel has no species in the EU quota list`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.5.b", "27.5.c"),
            seizureAndDiversion = false,
            speciesOnboard = getSpecies(listOf("HKE", "ANN", "BOR")),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.GB,
            userTrigram = "LTH"
        )

        // When
        val isLandControlApplicable = jdp.isLandControlApplicable(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.NORTH_SEA -> assertThat(isLandControlApplicable).isFalse()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(isLandControlApplicable).isFalse()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `getFirstFaoAreaIncludedInJdp Should return the fao area When the first JDP found is the JDP of the Act-Rep`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
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
            userTrigram = "LTH"
        )

        // When
        val faoArea = jdp.getFirstFaoAreaIncludedInJdp(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(faoArea?.faoCode).isNull()
            JointDeploymentPlan.NORTH_SEA -> assertThat(faoArea?.faoCode).isEqualTo("27.4.c")
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(faoArea?.faoCode).isNull()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `getFirstFaoAreaIncludedInJdp Should return the fao area for all Act-Rep When the control is done at LAND (because the filtering is done in isLandControlApplicable)`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.LAND_CONTROL,
            faoAreas = listOf("27.7.b", "27.4.c"),
            seizureAndDiversion = false,
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val faoArea = jdp.getFirstFaoAreaIncludedInJdp(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(faoArea?.faoCode).isEqualTo("27.7.b")
            JointDeploymentPlan.NORTH_SEA -> assertThat(faoArea?.faoCode).isEqualTo("27.4.c")
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(faoArea?.faoCode).isEqualTo("27.7.b")
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `getFirstFaoAreaIncludedInJdp Should return the fao area When the control contains BFT for the MEDITERRANEAN_AND_EASTERN_ATLANTIC JDP`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val firstSpecy = SpeciesControl()
        firstSpecy.speciesCode = "BFT"
        val secondSpecy = SpeciesControl()
        secondSpecy.speciesCode = "HKE"
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.7.b", "27.4.c"),
            seizureAndDiversion = false,
            speciesOnboard = listOf(firstSpecy, secondSpecy),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val faoArea = jdp.getFirstFaoAreaIncludedInJdp(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(faoArea?.faoCode).isEqualTo("27.7.b")
            JointDeploymentPlan.NORTH_SEA -> assertThat(faoArea?.faoCode).isNull()
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(faoArea?.faoCode).isNull()
        }
    }

    @ParameterizedTest
    @EnumSource(JointDeploymentPlan::class)
    fun `getFirstFaoAreaIncludedInJdp Should return the fao area for the NORTH_SEA JDP When the control does not contains BFT for the MEDITERRANEAN_AND_EASTERN_ATLANTIC JDP`(
        jdp: JointDeploymentPlan,
    ) {
        // Given
        val specy = SpeciesControl()
        specy.speciesCode = "HKE"
        val control = MissionAction(
            id = 3,
            vesselId = 2,
            missionId = 3,
            actionDatetimeUtc = ZonedDateTime.now(),
            actionType = MissionActionType.SEA_CONTROL,
            faoAreas = listOf("27.7.b", "27.4.c"),
            seizureAndDiversion = false,
            speciesOnboard = listOf(specy),
            speciesInfractions = listOf(),
            isDeleted = false,
            hasSomeGearsSeized = false,
            hasSomeSpeciesSeized = false,
            isFromPoseidon = false,
            completion = Completion.TO_COMPLETE,
            flagState = CountryCode.FR,
            userTrigram = "LTH"
        )

        // When
        val faoArea = jdp.getFirstFaoAreaIncludedInJdp(control)

        // Then
        when (jdp) {
            JointDeploymentPlan.MEDITERRANEAN_AND_EASTERN_ATLANTIC -> assertThat(faoArea?.faoCode).isNull()
            JointDeploymentPlan.NORTH_SEA -> assertThat(faoArea?.faoCode).isEqualTo("27.4.c")
            JointDeploymentPlan.WESTERN_WATERS -> assertThat(faoArea?.faoCode).isNull()
        }
    }

    private fun getSpecies(species: List<String>): List<SpeciesControl> {
        return species.map {
            val specy = SpeciesControl()
            specy.speciesCode = it

            return@map specy
        }
    }
}
