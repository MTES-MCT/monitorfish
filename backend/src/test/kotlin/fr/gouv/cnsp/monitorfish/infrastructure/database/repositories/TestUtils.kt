package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyMissionAction(dateTime: ZonedDateTime) = MissionAction(
        actionDatetimeUtc = dateTime,
        missionId = 2,
        vesselId = 2,
        actionType = MissionActionType.SEA_CONTROL,
        emitsVms = ControlCheck.YES,
        emitsAis = ControlCheck.NOT_APPLICABLE,
        logbookMatchesActivity = ControlCheck.NO,
        speciesWeightControlled = true,
        speciesSizeControlled = true,
        separateStowageOfPreservedSpecies = true,
        logbookInfractions = listOf(
            LogbookInfraction(
                InfractionType.WITH_RECORD,
                27689,
                "Poids à bord MNZ supérieur de 50% au poids déclaré"
            )
        ),
        gearInfractions = listOf(GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite")),
        controlQualityComments = "Ciblage CNSP respecté",
        feedbackSheetRequired = true,
        userTrigram = "DEF",
        facade = "Manche ouest - Atlantique",
        longitude = -6.56,
        latitude = 45.12
    )
}
