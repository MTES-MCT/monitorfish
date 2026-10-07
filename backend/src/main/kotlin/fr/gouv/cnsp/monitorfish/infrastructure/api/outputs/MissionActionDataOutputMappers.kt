package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionInfractionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.toContract
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.InfractionType as ContractInfractionType

fun Infraction.toMissionActionInfractionDataOutputWithThreatHierarchy(): MissionActionInfractionDataOutput {
    // A pending infraction has no threat/NATINF yet, so there is no hierarchy to build
    if (infractionType == InfractionType.PENDING) {
        return MissionActionInfractionDataOutput(
            infractionType = ContractInfractionType.PENDING,
            comments = comments,
        )
    }

    return MissionActionInfractionDataOutput(
        infractionType = infractionType!!.toContract(),
        threats = listOf(InfractionThreatCharacterizationDataOutput.fromInfraction(this)),
        comments = comments,
    )
}

fun Infraction.toMissionActionInfractionDataOutput() =
    MissionActionInfractionDataOutput(
        infractionType = infractionType!!.toContract(),
        natinf = natinf,
        natinfDescription = natinfDescription,
        threat = threat ?: "Famille inconnue",
        threatCharacterization = threatCharacterization ?: "Type inconnu",
        comments = comments,
    )

fun MissionAction.toMissionActionDataOutput(useThreatHierarchyForForm: Boolean = true) =
    MissionActionDataOutput(
        id = id,
        vesselId = vesselId,
        vesselName = vesselName,
        internalReferenceNumber = internalReferenceNumber,
        externalReferenceNumber = externalReferenceNumber,
        ircs = ircs,
        flagState = flagState,
        districtCode = districtCode,
        faoAreas = faoAreas,
        flightGoals = flightGoals.map { it.toContract() },
        missionId = missionId,
        actionType = actionType.toContract(),
        actionDatetimeUtc = actionDatetimeUtc,
        actionEndDatetimeUtc = actionEndDatetimeUtc,
        emitsVms = emitsVms?.toContract(),
        emitsAis = emitsAis?.toContract(),
        vmsEmissionControlBeforeArrival = vmsEmissionControlBeforeArrival?.toContract(),
        portEntranceAndLandingAuthorized = portEntranceAndLandingAuthorized?.toContract(),
        logbookOpenedPriorToControl = logbookOpenedPriorToControl?.toContract(),
        logbookMatchesActivity = logbookMatchesActivity?.toContract(),
        licencesMatchActivity = licencesMatchActivity?.toContract(),
        speciesWeightControlled = speciesWeightControlled?.toContract(),
        speciesSizeControlled = speciesSizeControlled?.toContract(),
        separateStowageOfPreservedSpecies = separateStowageOfPreservedSpecies?.toContract(),
        propulsionEnginePowerControl = propulsionEnginePowerControl?.toContract(),
        gangwayPresentAndCompliant = gangwayPresentAndCompliant?.toContract(),
        europeanFishingLicenceValid = europeanFishingLicenceValid?.toContract(),
        stowagePlanPresent = stowagePlanPresent?.toContract(),
        onboardWeighingPermit = onboardWeighingPermit?.toContract(),
        weighingCertificateAndSystemsValid = weighingCertificateAndSystemsValid?.toContract(),
        underSizedSeparateStowage = underSizedSeparateStowage?.toContract(),
        underSizedSeparateRecording = underSizedSeparateRecording?.toContract(),
        weightControlMethod = weightControlMethod?.toContract(),
        approvedWeighingOperatorInformation = approvedWeighingOperatorInformation?.toContract(),
        holdControlledAfterUnloading = holdControlledAfterUnloading?.toContract(),
        weighingOperationsMonitoredByInspectors = weighingOperationsMonitoredByInspectors?.toContract(),
        licencesAndLogbookObservations = licencesAndLogbookObservations,
        infractions =
            infractions.map {
                if (useThreatHierarchyForForm) {
                    it.toMissionActionInfractionDataOutputWithThreatHierarchy()
                } else {
                    it.toMissionActionInfractionDataOutput()
                }
            },
        speciesObservations = speciesObservations,
        seizureAndDiversion = seizureAndDiversion,
        numberOfVesselsFlownOver = numberOfVesselsFlownOver,
        unitWithoutOmegaGauge = unitWithoutOmegaGauge,
        controlQualityComments = controlQualityComments,
        segments = segments.map { it.toMissionActionFleetSegmentDataOutput() },
        facade = facade,
        longitude = longitude,
        latitude = latitude,
        portLocode = portLocode,
        portName = portName,
        seizureAndDiversionComments = seizureAndDiversionComments,
        otherComments = otherComments,
        gearOnboard = gearOnboard.map { it.toGearControlDataOutput() },
        speciesOnboard = speciesOnboard.map { it.toSpeciesOnboardControlDataOutput() },
        discardedSpecies = discardedSpecies.map { it.toDiscardedSpeciesControlDataOutput() },
        vesselGroups = vesselGroups.map { it.toMissionActionVesselGroupDataOutput() },
        tripReportings = tripReportings.map { it.toMissionActionReportingDataOutput() },
        controlUnits = controlUnits.map { it.toMissionActionControlUnitDataOutput() },
        userTrigram = userTrigram,
        isPrioritized = isPrioritized,
        hasSomeGearsSeized = hasSomeGearsSeized,
        hasSomeSpeciesSeized = hasSomeSpeciesSeized,
        speciesQuantitySeized = speciesQuantitySeized,
        completedBy = completedBy,
        completion = completion.toContract(),
        isFromPoseidon = isFromPoseidon,
        isLastHaul = isLastHaul,
        isAdministrativeControl = isAdministrativeControl,
        isComplianceWithWaterRegulationsControl = isComplianceWithWaterRegulationsControl,
        isSafetyEquipmentAndStandardsComplianceControl =
        isSafetyEquipmentAndStandardsComplianceControl,
        isSeafarersControl = isSeafarersControl,
        isINNControl = isINNControl,
        isUnitBoarded = isUnitBoarded,
        isEISR = isEISR,
        observationsByUnit = observationsByUnit,
    )
