package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyMissionAction(dateTime: ZonedDateTime, id: Int? = null) = MissionAction(
        id = id,
        actionDatetimeUtc = dateTime,
        missionId = 2,
        vesselId = 2,
        internalReferenceNumber = "FR0564654",
        externalReferenceNumber = "FDEY874",
        ircs = "FDZFEE",
        flagState = "FR",
        actionType = MissionActionType.SEA_CONTROL,
        flightGoals = listOf(FlightGoal.CLOSED_AREA, FlightGoal.UNAUTHORIZED_FISHING),
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
                "Poids à bord MNZ supérieur de 50% au poids déclaré",
            ),
        ),
        segments = listOf(
            FleetSegment(faoAreas = listOf("25.6.9", "25.7.9"), segment = "WWSS10", segmentName = "World Wide Segment")
        ),
        gearInfractions = listOf(GearInfraction(InfractionType.WITH_RECORD, 27689, "Maille trop petite")),
        controlQualityComments = "Ciblage CNSP respecté",
        feedbackSheetRequired = true,
        userTrigram = "DEF",
        facade = "Manche ouest - Atlantique",
        longitude = -6.56,
        latitude = 45.12,
    )
}
