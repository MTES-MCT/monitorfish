package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.*
import java.time.ZonedDateTime

@JsonInclude(JsonInclude.Include.NON_NULL)
data class MissionActionInfractionDataOutput(
    val infractionType: InfractionType,
    // This field is used to control the Threat CheckTreePicker
    val threats: List<ThreatHierarchyDataOutput>? = null,
    val natinf: Int? = null,
    val natinfDescription: String? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    val comments: String? = null,
) {
    companion object {
        fun fromInfractionWithThreatHierarchy(infraction: Infraction) =
            MissionActionInfractionDataOutput(
                infractionType = infraction.infractionType!!,
                threats =
                    listOf(
                        InfractionThreatCharacterizationDataOutput.fromInfraction(infraction),
                    ),
                comments = infraction.comments,
            )

        fun fromInfraction(infraction: Infraction) =
            MissionActionInfractionDataOutput(
                infractionType = infraction.infractionType!!,
                natinf = infraction.natinf,
                natinfDescription = infraction.natinfDescription,
                threat = infraction.threat ?: "Famille inconnue",
                threatCharacterization = infraction.threatCharacterization ?: "Type inconnu",
                comments = infraction.comments,
            )
    }
}

data class MissionActionDataOutput(
    val id: Int? = null,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val flagState: CountryCode,
    val districtCode: String? = null,
    val faoAreas: List<String> = listOf(),
    val flightGoals: List<FlightGoal> = listOf(),
    val missionId: Int,
    val actionType: MissionActionType,
    val actionDatetimeUtc: ZonedDateTime,
    val actionEndDatetimeUtc: ZonedDateTime? = null,
    val emitsVms: ControlCheck? = null,
    val emitsAis: ControlCheck? = null,
    val vmsEmissionControlBeforeArrival: ControlCheck? = null,
    val portEntranceAndLandingAuthorized: ControlCheck? = null,
    val logbookFilledPriorToControl: ControlCheck? = null,
    val logbookMatchesActivity: ControlCheck? = null,
    val licencesMatchActivity: ControlCheck? = null,
    val speciesWeightControlled: ControlCheck? = null,
    val speciesSizeControlled: ControlCheck? = null,
    val separateStowageOfPreservedSpecies: ControlCheck? = null,
    val propulsionEnginePowerControl: ControlCheck? = null,
    val fishingLicencesMatchActivity: ControlCheck? = null,
    val stowagePlanPresent: ControlCheck? = null,
    val onboardWeighingPermit: ControlCheck? = null,
    val weighingCertificateAndSystemsValid: ControlCheck? = null,
    val underSizedSeparateStowage: ControlCheck? = null,
    val underSizedSeparateRecording: ControlCheck? = null,
    val minimumConservationReferenceSizeControlled: ControlCheck? = null,
    val cratesWeighingSamplingControl: ControlCheck? = null,
    val approvedWeighingOperatorInformation: ControlCheck? = null,
    val holdControlledAfterUnloading: ControlCheck? = null,
    val catchesWeighedAtLanding: ControlCheck? = null,
    val licencesAndLogbookObservations: String? = null,
    val infractions: List<MissionActionInfractionDataOutput> = listOf(),
    val speciesObservations: String? = null,
    val seizureAndDiversion: Boolean? = null,
    val numberOfVesselsFlownOver: Int? = null,
    val unitWithoutOmegaGauge: Boolean? = null,
    val controlQualityComments: String? = null,
    val segments: List<FleetSegment> = listOf(),
    val facade: String? = null,
    val longitude: Double? = null,
    val latitude: Double? = null,
    val portLocode: String? = null,
    val portName: String? = null,
    val seizureAndDiversionComments: String? = null,
    val otherComments: String? = null,
    val gearOnboard: List<GearControl> = listOf(),
    val speciesOnboard: List<SpeciesControl> = listOf(),
    val controlUnits: List<LegacyControlUnit> = listOf(),
    val userTrigram: String,
    val vesselTargeted: ControlCheck? = null,
    val hasSomeGearsSeized: Boolean,
    val hasSomeSpeciesSeized: Boolean,
    val speciesQuantitySeized: Int? = null,
    val completedBy: String? = null,
    val completion: Completion,
    val isFromPoseidon: Boolean,
    val isLastHaul: Boolean,
    val isAdministrativeControl: Boolean? = null,
    val isComplianceWithWaterRegulationsControl: Boolean? = null,
    val isSafetyEquipmentAndStandardsComplianceControl: Boolean? = null,
    val isSeafarersControl: Boolean? = null,
    val isINNControl: Boolean = false,
    val isGangwayDeployed: Boolean? = null,
    val observationsByUnit: String? = null,
) {
    companion object {
        fun fromMissionAction(
            missionAction: MissionAction,
            useThreatHierarchyForForm: Boolean = true,
        ) = MissionActionDataOutput(
            id = missionAction.id,
            vesselId = missionAction.vesselId,
            vesselName = missionAction.vesselName,
            internalReferenceNumber = missionAction.internalReferenceNumber,
            externalReferenceNumber = missionAction.externalReferenceNumber,
            ircs = missionAction.ircs,
            flagState = missionAction.flagState,
            districtCode = missionAction.districtCode,
            faoAreas = missionAction.faoAreas,
            flightGoals = missionAction.flightGoals,
            missionId = missionAction.missionId,
            actionType = missionAction.actionType,
            actionDatetimeUtc = missionAction.actionDatetimeUtc,
            actionEndDatetimeUtc = missionAction.actionEndDatetimeUtc,
            emitsVms = missionAction.emitsVms,
            emitsAis = missionAction.emitsAis,
            vmsEmissionControlBeforeArrival = missionAction.vmsEmissionControlBeforeArrival,
            portEntranceAndLandingAuthorized = missionAction.portEntranceAndLandingAuthorized,
            logbookFilledPriorToControl = missionAction.logbookFilledPriorToControl,
            logbookMatchesActivity = missionAction.logbookMatchesActivity,
            licencesMatchActivity = missionAction.licencesMatchActivity,
            speciesWeightControlled = missionAction.speciesWeightControlled,
            speciesSizeControlled = missionAction.speciesSizeControlled,
            separateStowageOfPreservedSpecies = missionAction.separateStowageOfPreservedSpecies,
            propulsionEnginePowerControl = missionAction.propulsionEnginePowerControl,
            fishingLicencesMatchActivity = missionAction.fishingLicencesMatchActivity,
            stowagePlanPresent = missionAction.stowagePlanPresent,
            onboardWeighingPermit = missionAction.onboardWeighingPermit,
            weighingCertificateAndSystemsValid = missionAction.weighingCertificateAndSystemsValid,
            underSizedSeparateStowage = missionAction.underSizedSeparateStowage,
            underSizedSeparateRecording = missionAction.underSizedSeparateRecording,
            minimumConservationReferenceSizeControlled = missionAction.minimumConservationReferenceSizeControlled,
            cratesWeighingSamplingControl = missionAction.cratesWeighingSamplingControl,
            approvedWeighingOperatorInformation = missionAction.approvedWeighingOperatorInformation,
            holdControlledAfterUnloading = missionAction.holdControlledAfterUnloading,
            catchesWeighedAtLanding = missionAction.catchesWeighedAtLanding,
            licencesAndLogbookObservations = missionAction.licencesAndLogbookObservations,
            infractions =
                missionAction.infractions.map {
                    if (useThreatHierarchyForForm) {
                        MissionActionInfractionDataOutput.fromInfractionWithThreatHierarchy(it)
                    } else {
                        MissionActionInfractionDataOutput.fromInfraction(it)
                    }
                },
            speciesObservations = missionAction.speciesObservations,
            seizureAndDiversion = missionAction.seizureAndDiversion,
            numberOfVesselsFlownOver = missionAction.numberOfVesselsFlownOver,
            unitWithoutOmegaGauge = missionAction.unitWithoutOmegaGauge,
            controlQualityComments = missionAction.controlQualityComments,
            segments = missionAction.segments,
            facade = missionAction.facade,
            longitude = missionAction.longitude,
            latitude = missionAction.latitude,
            portLocode = missionAction.portLocode,
            portName = missionAction.portName,
            seizureAndDiversionComments = missionAction.seizureAndDiversionComments,
            otherComments = missionAction.otherComments,
            gearOnboard = missionAction.gearOnboard,
            speciesOnboard = missionAction.speciesOnboard,
            controlUnits = missionAction.controlUnits,
            userTrigram = missionAction.userTrigram,
            vesselTargeted = missionAction.vesselTargeted,
            hasSomeGearsSeized = missionAction.hasSomeGearsSeized,
            hasSomeSpeciesSeized = missionAction.hasSomeSpeciesSeized,
            speciesQuantitySeized = missionAction.speciesQuantitySeized,
            completedBy = missionAction.completedBy,
            completion = missionAction.completion,
            isFromPoseidon = missionAction.isFromPoseidon,
            isLastHaul = missionAction.isLastHaul,
            isAdministrativeControl = missionAction.isAdministrativeControl,
            isComplianceWithWaterRegulationsControl = missionAction.isComplianceWithWaterRegulationsControl,
            isSafetyEquipmentAndStandardsComplianceControl = missionAction.isSafetyEquipmentAndStandardsComplianceControl,
            isSeafarersControl = missionAction.isSeafarersControl,
            isINNControl = missionAction.isINNControl,
            isGangwayDeployed = missionAction.isGangwayDeployed,
            observationsByUnit = missionAction.observationsByUnit,
        )
    }
}
