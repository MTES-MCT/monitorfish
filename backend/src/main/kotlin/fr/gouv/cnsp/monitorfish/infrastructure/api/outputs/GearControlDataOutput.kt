package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WireType

data class GearControlDataOutput(
    var gearCode: String? = null,
    var gearName: String? = null,
    var declaredMesh: Double? = null,
    var controlledMesh: Double? = null,
    var hasUncontrolledMesh: Boolean,
    var gearWasControlled: Boolean? = null,
    var gearMarkingIsCompliant: ControlCheck? = null,
    var averageWireThickness: Double? = null,
    var wireType: WireType? = null,
    var comments: String? = null,
) {
    companion object {
        fun fromGearControl(gearControl: GearControl) =
            GearControlDataOutput(
                gearCode = gearControl.gearCode,
                gearName = gearControl.gearName,
                declaredMesh = gearControl.declaredMesh,
                controlledMesh = gearControl.controlledMesh,
                hasUncontrolledMesh = gearControl.hasUncontrolledMesh,
                gearWasControlled = gearControl.gearWasControlled,
                gearMarkingIsCompliant = gearControl.gearMarkingIsCompliant,
                averageWireThickness = gearControl.averageWireThickness,
                wireType = gearControl.wireType,
                comments = gearControl.comments,
            )
    }
}
