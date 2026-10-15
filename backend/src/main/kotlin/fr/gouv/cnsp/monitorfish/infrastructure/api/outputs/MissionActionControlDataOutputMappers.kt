package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardedSpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesOnboardControl
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.DiscardedSpeciesControlDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.GearControlDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionFleetSegmentDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.SpeciesOnboardControlDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.toContract

fun GearControl.toGearControlDataOutput() =
    GearControlDataOutput(
        gearCode = gearCode,
        gearName = gearName,
        declaredMesh = declaredMesh,
        controlledMesh = controlledMesh,
        hasUncontrolledMesh = hasUncontrolledMesh,
        gearWasControlled = gearWasControlled,
        gearMarkingIsCompliant = gearMarkingIsCompliant?.toContract(),
        averageWireThickness = averageWireThickness,
        wireType = wireType?.toContract(),
        comments = comments,
    )

fun SpeciesOnboardControl.toSpeciesOnboardControlDataOutput() =
    SpeciesOnboardControlDataOutput(
        speciesCode = speciesCode,
        speciesName = speciesName,
        isNotLanded = isNotLanded,
        nbFish = nbFish,
        declaredWeight = declaredWeight,
        controlledWeight = controlledWeight,
        underSized = underSized,
        underSizedWeight = underSizedWeight,
        presentationCodes = presentationCodes,
        faoZones = faoZones,
        toleranceMargin = toleranceMargin,
    )

fun DiscardedSpeciesControl.toDiscardedSpeciesControlDataOutput() =
    DiscardedSpeciesControlDataOutput(
        speciesCode = speciesCode,
        rejectedWeight = rejectedWeight,
        discardReason = discardReason?.toContract(),
        faoZones = faoZones,
    )

fun FleetSegment.toMissionActionFleetSegmentDataOutput() =
    MissionActionFleetSegmentDataOutput(
        segment = segment,
        segmentName = segmentName,
    )
