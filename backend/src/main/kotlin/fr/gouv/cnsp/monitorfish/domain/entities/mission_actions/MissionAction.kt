package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import java.time.ZonedDateTime

data class MissionAction(
    val id: Int? = null,
    val vesselId: Int,
    val missionId: Int,
    val actionType: MissionActionType,
    val actionDatetimeUtc: ZonedDateTime,
    val emitsVms: ControlCheck? = null,
    val emitsAis: ControlCheck? = null,
    val logbookMatchesActivity: ControlCheck? = null,
    val licencesMatchActivity: ControlCheck? = null,
    val speciesWeightControlled: Boolean? = null,
    val speciesSizeControlled: Boolean? = null,
    val separateStowageOfPreservedSpecies: Boolean? = null,
    val logbookInfractions: List<LogbookInfraction> = listOf(),
    val licencesAndLogbookObservations: String? = null,
    val gearInfractions: List<GearInfraction> = listOf(),
    val speciesInfractions: List<SpeciesInfraction> = listOf(),
    val speciesObservations: String? = null,
    val seizureAndDiversion: Boolean? = null,
    val otherInfractions: List<OtherInfraction> = listOf(),
    val numberOfVesselsFlownOver: Int? = null,
    val unitWithoutOmegaGauge: Boolean? = null,
    val controlQualityComments: String? = null,
    val feedbackSheetRequired: Boolean? = null,
    val userTrigram: String? = null,
    val segments: String? = null,
    val facade: String? = null,
    val longitude: Double? = null,
    val latitude: Double? = null,
    val portLocode: String? = null,
    var portName: String? = null,
    val vesselTargeted: Boolean? = null,
    val seizureAndDiversionComments: String? = null,
    val otherComments: String? = null,
    val gearOnboard: List<GearControl> = listOf(),
    val speciesOnboard: List<SpeciesControl> = listOf(),
    var controlUnits: List<ControlUnit> = listOf()
)
