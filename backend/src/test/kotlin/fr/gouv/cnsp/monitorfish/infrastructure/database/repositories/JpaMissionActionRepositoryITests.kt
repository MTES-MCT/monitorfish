package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.ControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.InfractionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDummyMissionAction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.ZonedDateTime

class JpaMissionActionRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaMissionActionsRepository: JpaMissionActionsRepository

    @Test
    @Transactional
    fun `findVesselMissionActionsAfterDateTime Should filter vessel's controls around the date time`() {
        // Given
        // This test is written to prevent time zone error
        val dateTime = ZonedDateTime.of(2019, 1, 18, 7, 19, 45, 45, ZoneOffset.UTC)

        // When
        val controls = jpaMissionActionsRepository.findVesselMissionActionsAfterDateTime(1, dateTime)

        // Then
        assertThat(controls).hasSize(6)
    }

    @Test
    @Transactional
    fun `findVesselMissionActionsAfterDateTime Should return all vessel's controls after a date time`() {
        // Given
        val dateTime = ZonedDateTime.now()
            .minusYears(1)
            .minusMonths(1)

        // When
        val controls = jpaMissionActionsRepository.findVesselMissionActionsAfterDateTime(1, dateTime)

        // Then
        assertThat(controls).hasSize(3)
        val firstControl = controls.first()

        assertThat(firstControl.emitsVms).isEqualTo(ControlCheck.YES)
        assertThat(firstControl.emitsAis).isEqualTo(ControlCheck.NOT_APPLICABLE)
        assertThat(firstControl.logbookMatchesActivity).isEqualTo(ControlCheck.NO)
        assertThat(firstControl.speciesWeightControlled).isTrue
        assertThat(firstControl.speciesSizeControlled).isTrue
        assertThat(firstControl.separateStowageOfPreservedSpecies).isEqualTo(ControlCheck.YES)
        assertThat(firstControl.faoAreas).hasSize(2)
        assertThat(firstControl.faoAreas.first()).isEqualTo("27.7.d")
        assertThat(firstControl.faoAreas.last()).isEqualTo("27.7.e")
        assertThat(firstControl.logbookInfractions).hasSize(1)
        assertThat(firstControl.logbookInfractions.first().infractionType).isEqualTo(InfractionType.WITH_RECORD)
        assertThat(firstControl.logbookInfractions.first().natinf).isEqualTo(27689)
        assertThat(firstControl.logbookInfractions.first().comments).contains(
            "Poids à bord MNZ supérieur de 50% au poids déclaré",
        )
        assertThat(firstControl.licencesAndLogbookObservations).isEqualTo(
            "C'est pas très très bien réglo toute cette poissecalle non déclarée",
        )
        assertThat(firstControl.gearInfractions).hasSize(2)
        assertThat(firstControl.gearInfractions.first().infractionType).isEqualTo(InfractionType.WITH_RECORD)
        assertThat(firstControl.gearInfractions.first().gearSeized).isNull()
        assertThat(firstControl.gearInfractions.first().natinf).isEqualTo(23581)
        assertThat(firstControl.gearInfractions.first().comments).isEqualTo("Maille trop petite")
        assertThat(firstControl.speciesInfractions).hasSize(1)
        assertThat(firstControl.speciesInfractions.first().infractionType).isEqualTo(InfractionType.WITHOUT_RECORD)
        assertThat(firstControl.speciesInfractions.first().speciesSeized).isEqualTo(true)
        assertThat(firstControl.speciesInfractions.first().natinf).isEqualTo(28346)
        assertThat(firstControl.speciesInfractions.first().comments).isEqualTo("Sous taille de 8cm")
        assertThat(firstControl.speciesObservations).isEqualTo("Saisie de l'ensemble des captures à bord")
        assertThat(firstControl.seizureAndDiversion).isTrue
        assertThat(firstControl.otherInfractions).hasSize(2)
        assertThat(firstControl.otherInfractions.first().infractionType).isEqualTo(InfractionType.WITH_RECORD)
        assertThat(firstControl.otherInfractions.first().natinf).isEqualTo(23588)
        assertThat(firstControl.otherInfractions.first().comments).isEqualTo(
            "Chalutage répété dans les 3 milles sur Piste VMS - confirmé de visu",
        )
        assertThat(firstControl.numberOfVesselsFlownOver).isNull()
        assertThat(firstControl.unitWithoutOmegaGauge).isFalse
        assertThat(firstControl.controlQualityComments).isEqualTo("Ciblage CNSP non respecté")
        assertThat(firstControl.feedbackSheetRequired).isTrue
        assertThat(firstControl.userTrigram).isEqualTo("DEF")
        assertThat(firstControl.segments).hasSize(2)
        assertThat(firstControl.segments.first().segment).isEqualTo("SWW04")
        assertThat(firstControl.segments.first().segmentName).isEqualTo("Midwater trawls")
        assertThat(firstControl.facade).isEqualTo("Manche ouest - Atlantique")
        assertThat(firstControl.longitude).isEqualTo(-0.52)
        assertThat(firstControl.latitude).isEqualTo(47.44)
        assertThat(firstControl.portLocode).isNull()
        assertThat(firstControl.vesselTargeted).isEqualTo(ControlCheck.NO)
        assertThat(firstControl.seizureAndDiversion).isTrue
        assertThat(firstControl.seizureAndDiversionComments).isEqualTo("Saisie de la pêche")
        assertThat(firstControl.otherComments).isEqualTo("Commentaires post contrôle")
        assertThat(firstControl.gearOnboard).hasSize(2)
        assertThat(firstControl.gearOnboard.first().gearCode).isEqualTo("OTB")
        assertThat(firstControl.gearOnboard.first().declaredMesh).isEqualTo(60.0)
        assertThat(firstControl.gearOnboard.first().controlledMesh).isNull()
        assertThat(firstControl.gearOnboard.first().gearWasControlled).isFalse
        assertThat(firstControl.speciesOnboard).hasSize(2)
        assertThat(firstControl.speciesOnboard.first().speciesCode).isEqualTo("MNZ")
        assertThat(firstControl.speciesOnboard.first().declaredWeight).isEqualTo(302.5)
        assertThat(firstControl.speciesOnboard.first().controlledWeight).isEqualTo(450.0)
        assertThat(firstControl.speciesOnboard.first().nbFish).isNull()
        assertThat(firstControl.speciesOnboard.first().underSized).isTrue
        assertThat(firstControl.controlUnits).hasSize(0)
        assertThat(firstControl.actionType).isEqualTo(MissionActionType.SEA_CONTROL)
    }

    @Test
    @Transactional
    fun `findVesselMissionActionsAfterDateTime Should return no vessel controls before a date time`() {
        // Given
        val dateTime = ZonedDateTime.now().plusYears(2)

        // When
        val controls = jpaMissionActionsRepository.findVesselMissionActionsAfterDateTime(1, dateTime)

        // Then
        assertThat(controls).hasSize(0)
    }

    @Test
    @Transactional
    fun `saveMissionActions Should save a new mission action`() {
        // Given
        val dateTime = ZonedDateTime.now(ZoneId.of("UTC"))
        val newMission = getDummyMissionAction(dateTime)

        // When
        val missionAction = jpaMissionActionsRepository.save(newMission)

        // Then
        assertThat(missionAction.id).isEqualTo(11)
        assertThat(missionAction.actionDatetimeUtc).isEqualTo(dateTime)
    }

    @Test
    @Transactional
    fun `saveMissionActions Should update an existing mission action`() {
        // Given
        val dateTime = ZonedDateTime.now()
        val expectedId = 2
        val updatedMission = getDummyMissionAction(dateTime, expectedId)

        val existingAction = jpaMissionActionsRepository.findByMissionId(2)
        assertThat(existingAction.first().latitude).isEqualTo(47.44)
        assertThat(existingAction.first().longitude).isEqualTo(-0.52)

        // When
        val updatedMissionAction = jpaMissionActionsRepository.save(updatedMission)

        // Then
        assertThat(updatedMissionAction.id).isEqualTo(expectedId)
        assertThat(updatedMissionAction.actionDatetimeUtc).isEqualTo(dateTime)
        assertThat(updatedMissionAction.latitude).isEqualTo(45.12)
        assertThat(updatedMissionAction.longitude).isEqualTo(-6.56)
    }

    @Test
    @Transactional
    fun `findByMissionId Should return actions of a given mission`() {
        // When
        val actions = jpaMissionActionsRepository.findByMissionId(6)

        // Then
        assertThat(actions).hasSize(2)
        assertThat(actions.last().actionDatetimeUtc).isEqualTo(ZonedDateTime.parse("2021-02-10T12:11:18.884456Z"))
        assertThat(actions.last().actionType).isEqualTo(MissionActionType.AIR_CONTROL)
    }

    @Test
    @Transactional
    fun `findMissionActionsIn Should return all mission actions with multiple mission ids`() {
        // When
        val actions = jpaMissionActionsRepository.findMissionActionsIn(listOf(1, 2, 3, 34))

        // Then
        assertThat(actions).hasSize(4)
        assertThat(actions.first().vesselName).isEqualTo("PHENOMENE")
        assertThat(actions.first().internalReferenceNumber).isEqualTo("FAK000999999")
    }
}
