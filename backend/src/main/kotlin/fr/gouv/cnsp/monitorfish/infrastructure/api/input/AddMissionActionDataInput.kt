package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FlightGoal
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionReporting
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WeightControlMethod
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionVesselGroup
import java.time.ZonedDateTime

data class MissionActionInfractionDataInput(
    val infractionType: InfractionType,
    val threats: List<ThreatHierarchyDataInput> = emptyList(),
    val comments: String? = null,
) {
    fun toInfraction(): Infraction {
        if (infractionType == InfractionType.PENDING) {
            return Infraction(infractionType = infractionType, comments = comments)
        }

        val threat = threats.single()
        val threatName = threat.value
        val threatCharacterization = threat.children.single().value
        val natinf =
            threat.children
                .single()
                .children
                .single()
                .value

        return Infraction(
            infractionType = this.infractionType,
            natinf = natinf,
            threat = threatName,
            threatCharacterization = threatCharacterization,
            comments = this.comments,
        )
    }
}

data class AddMissionActionDataInput(
    var missionId: Int,
    var vesselId: Int? = null,
    var vesselName: String? = null,
    var internalReferenceNumber: String? = null,
    var externalReferenceNumber: String? = null,
    var ircs: String? = null,
    var flagState: CountryCode? = CountryCode.UNDEFINED,
    var districtCode: String? = null,
    var faoAreas: List<String> = listOf(),
    var flightGoals: List<FlightGoal> = listOf(),
    var actionType: MissionActionType,
    var actionDatetimeUtc: ZonedDateTime,
    var emitsVms: ControlCheck? = null,
    var emitsAis: ControlCheck? = null,
    var vmsEmissionControlBeforeArrival: ControlCheck? = null,
    var portEntranceAndLandingAuthorized: ControlCheck? = null,
    var logbookOpenedPriorToControl: ControlCheck? = null,
    var logbookMatchesActivity: ControlCheck? = null,
    var licencesMatchActivity: ControlCheck? = null,
    var speciesWeightControlled: ControlCheck? = null,
    var speciesSizeControlled: ControlCheck? = null,
    var separateStowageOfPreservedSpecies: ControlCheck? = null,
    var propulsionEnginePowerControl: ControlCheck? = null,
    var gangwayPresentAndCompliant: ControlCheck? = null,
    var europeanFishingLicenceValid: ControlCheck? = null,
    var stowagePlanPresent: ControlCheck? = null,
    var onboardWeighingPermit: ControlCheck? = null,
    var weighingCertificateAndSystemsValid: ControlCheck? = null,
    var underSizedSeparateStowage: ControlCheck? = null,
    var underSizedSeparateRecording: ControlCheck? = null,
    var weightControlMethod: WeightControlMethod? = null,
    var approvedWeighingOperatorInformation: ControlCheck? = null,
    var holdControlledAfterUnloading: ControlCheck? = null,
    var weighingOperationsMonitoredByInspectors: ControlCheck? = null,
    var licencesAndLogbookObservations: String? = null,
    var infractions: List<MissionActionInfractionDataInput> = listOf(),
    var speciesObservations: String? = null,
    var seizureAndDiversion: Boolean? = null,
    var numberOfVesselsFlownOver: Int? = null,
    var unitWithoutOmegaGauge: Boolean? = null,
    var controlQualityComments: String? = null,
    var segments: List<FleetSegment> = listOf(),
    var facade: String? = null,
    var longitude: Double? = null,
    var latitude: Double? = null,
    var portLocode: String? = null,
    var seizureAndDiversionComments: String? = null,
    var otherComments: String? = null,
    var gearOnboard: List<GearControlDataInput> = listOf(),
    var userTrigram: String,
    var speciesOnboard: List<SpeciesOnboardControlDataInput> = listOf(),
    var discardedSpecies: List<DiscardedSpeciesControlDataInput> = listOf(),
    var vesselGroups: List<MissionActionVesselGroup> = listOf(),
    var tripReportings: List<MissionActionReporting> = listOf(),
    var hasSomeGearsSeized: Boolean = false,
    var hasSomeSpeciesSeized: Boolean = false,
    var speciesQuantitySeized: Int? = null,
    var completedBy: String? = null,
    var completion: Completion,
    val isFromPoseidon: Boolean? = null,
    val isLastHaul: Boolean? = null,
    var isAdministrativeControl: Boolean? = null,
    var isComplianceWithWaterRegulationsControl: Boolean? = null,
    var isSafetyEquipmentAndStandardsComplianceControl: Boolean? = null,
    var isSeafarersControl: Boolean? = null,
    var isINNControl: Boolean = false,
    val isUnitBoarded: Boolean? = null,
) {
    fun toMissionAction() =
        MissionAction(
            vesselId = vesselId,
            vesselName = vesselName,
            internalReferenceNumber = internalReferenceNumber,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            flagState = flagState ?: CountryCode.UNDEFINED,
            districtCode = districtCode,
            faoAreas = faoAreas,
            flightGoals = flightGoals,
            missionId = missionId,
            actionType = actionType,
            actionDatetimeUtc = actionDatetimeUtc,
            emitsVms = emitsVms,
            emitsAis = emitsAis,
            vmsEmissionControlBeforeArrival = vmsEmissionControlBeforeArrival,
            portEntranceAndLandingAuthorized = portEntranceAndLandingAuthorized,
            logbookOpenedPriorToControl = logbookOpenedPriorToControl,
            logbookMatchesActivity = logbookMatchesActivity,
            licencesMatchActivity = licencesMatchActivity,
            speciesWeightControlled = speciesWeightControlled,
            speciesSizeControlled = speciesSizeControlled,
            separateStowageOfPreservedSpecies = separateStowageOfPreservedSpecies,
            propulsionEnginePowerControl = propulsionEnginePowerControl,
            gangwayPresentAndCompliant = gangwayPresentAndCompliant,
            europeanFishingLicenceValid = europeanFishingLicenceValid,
            stowagePlanPresent = stowagePlanPresent,
            onboardWeighingPermit = onboardWeighingPermit,
            weighingCertificateAndSystemsValid = weighingCertificateAndSystemsValid,
            underSizedSeparateStowage = underSizedSeparateStowage,
            underSizedSeparateRecording = underSizedSeparateRecording,
            weightControlMethod = weightControlMethod,
            approvedWeighingOperatorInformation = approvedWeighingOperatorInformation,
            holdControlledAfterUnloading = holdControlledAfterUnloading,
            weighingOperationsMonitoredByInspectors = weighingOperationsMonitoredByInspectors,
            licencesAndLogbookObservations = licencesAndLogbookObservations,
            infractions = infractions.map { it.toInfraction() },
            speciesObservations = speciesObservations,
            seizureAndDiversion = seizureAndDiversion,
            numberOfVesselsFlownOver = numberOfVesselsFlownOver,
            unitWithoutOmegaGauge = unitWithoutOmegaGauge,
            controlQualityComments = controlQualityComments,
            segments = segments,
            facade = facade,
            longitude = longitude,
            latitude = latitude,
            portLocode = portLocode,
            seizureAndDiversionComments = seizureAndDiversionComments,
            otherComments = otherComments,
            gearOnboard = gearOnboard.map { it.toGearControl() },
            speciesOnboard = speciesOnboard.map { it.toSpeciesOnboardControl() },
            discardedSpecies = discardedSpecies.map { it.toDiscardedSpeciesControl() },
            vesselGroups = vesselGroups,
            tripReportings = tripReportings,
            userTrigram = userTrigram,
            isDeleted = false,
            hasSomeGearsSeized = hasSomeGearsSeized,
            hasSomeSpeciesSeized = hasSomeSpeciesSeized,
            speciesQuantitySeized = speciesQuantitySeized,
            completedBy = completedBy,
            completion = completion,
            isFromPoseidon = isFromPoseidon ?: false,
            isLastHaul = isLastHaul ?: false,
            isAdministrativeControl = isAdministrativeControl,
            isComplianceWithWaterRegulationsControl = isComplianceWithWaterRegulationsControl,
            isSafetyEquipmentAndStandardsComplianceControl = isSafetyEquipmentAndStandardsComplianceControl,
            isSeafarersControl = isSeafarersControl,
            isINNControl = isINNControl,
            isUnitBoarded = isUnitBoarded,
        )
}
