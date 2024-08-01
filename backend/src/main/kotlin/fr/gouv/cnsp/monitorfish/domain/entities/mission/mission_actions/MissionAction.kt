package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.Patchable
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import java.time.ZonedDateTime

data class MissionAction(
    val id: Int? = null,
    val missionId: Int,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val flagState: CountryCode,
    val districtCode: String? = null,
    val faoAreas: List<String> = listOf(),
    val actionType: MissionActionType,
    val actionDatetimeUtc: ZonedDateTime,
    @Patchable
    var actionEndDatetimeUtc: ZonedDateTime? = null,
    val emitsVms: ControlCheck? = null,
    val emitsAis: ControlCheck? = null,
    val flightGoals: List<FlightGoal> = listOf(),
    val logbookMatchesActivity: ControlCheck? = null,
    val licencesMatchActivity: ControlCheck? = null,
    val speciesWeightControlled: Boolean? = null,
    val speciesSizeControlled: Boolean? = null,
    val separateStowageOfPreservedSpecies: ControlCheck? = null,
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
    val userTrigram: String,
    val segments: List<FleetSegment> = listOf(),
    val facade: String? = null,
    val longitude: Double? = null,
    val latitude: Double? = null,
    val portLocode: String? = null,
    // This field is only used when fetching missions
    var portName: String? = null,
    val vesselTargeted: ControlCheck? = null,
    val seizureAndDiversionComments: String? = null,
    val otherComments: String? = null,
    val gearOnboard: List<GearControl> = listOf(),
    val speciesOnboard: List<SpeciesControl> = listOf(),
    val isFromPoseidon: Boolean,
    /**
     * This field is only used by the `GetVesselControls` use-case.
     * /!\ Do not use it to get `controlUnits` as the field will be empty be default.
     */
    var controlUnits: List<ControlUnit> = listOf(),
    val isDeleted: Boolean,
    val hasSomeGearsSeized: Boolean,
    val hasSomeSpeciesSeized: Boolean,
    val completedBy: String? = null,
    val completion: Completion,
    val isAdministrativeControl: Boolean? = null,
    val isComplianceWithWaterRegulationsControl: Boolean? = null,
    val isSafetyEquipmentAndStandardsComplianceControl: Boolean? = null,
    val isSeafarersControl: Boolean? = null,
    @Patchable
    var observationsByUnit: String? = null,
) {
    fun verify() {
        val controlTypes = listOf(
            MissionActionType.AIR_CONTROL,
            MissionActionType.LAND_CONTROL,
            MissionActionType.SEA_CONTROL,
        )

        if (controlTypes.any { it == this.actionType }) {
            require(this.vesselId != null) {
                "A control must specify a vessel: the `vesselId` must be given."
            }

            require(this.userTrigram.isNotEmpty()) {
                "A control must specify a user trigram: the `userTrigram` must be given."
            }

            when (this.actionType) {
                MissionActionType.AIR_CONTROL -> checkControlPosition()
                MissionActionType.SEA_CONTROL -> checkControlPosition()
                MissionActionType.LAND_CONTROL -> checkControlPort()
                else -> {}
            }
        }
    }

    private fun checkControlPosition() {
        require(this.longitude != null) {
            "A control must specify a position: the `longitude` must be given."
        }
        require(this.latitude != null) {
            "A control must specify a position: the `latitude` must be given."
        }
    }

    private fun checkControlPort() {
        require(this.portLocode != null) {
            "A land control must specify a port: the `portLocode` must be given."
        }
    }
}
