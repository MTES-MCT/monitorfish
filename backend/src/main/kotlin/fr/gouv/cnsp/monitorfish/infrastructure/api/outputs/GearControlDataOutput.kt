package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.GearControl

data class GearControlDataOutput(
    var gearCode: String? = null,
    var gearName: String? = null,
    var declaredMesh: Double? = null,
    var controlledMesh: Double? = null,
    var gearWasControlled: Boolean? = null,
) {
    companion object {
        fun fromGearControl(gearControl: GearControl) = GearControlDataOutput(
            gearCode = gearControl.gearCode,
            gearName = gearControl.gearName,
            declaredMesh = gearControl.declaredMesh,
            controlledMesh = gearControl.controlledMesh,
            gearWasControlled = gearControl.gearWasControlled,
        )
    }
}
