package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WireType

data class GearControlDataInput(
    val gearCode: String,
    val gearName: String?,
    val declaredMesh: Double?,
    val controlledMesh: Double?,
    val hasUncontrolledMesh: Boolean?,
    val gearWasControlled: Boolean?,
    val gearMarkingIsCompliant: ControlCheck? = null,
    val averageWireThickness: Double? = null,
    val wireType: WireType? = null,
    val comments: String?,
) {
    fun toGearControl() =
        GearControl().also { gearControl ->
            gearControl.gearCode = gearCode
            gearControl.gearName = gearName
            gearControl.declaredMesh = declaredMesh
            gearControl.controlledMesh = controlledMesh
            gearControl.hasUncontrolledMesh = hasUncontrolledMesh ?: false
            gearControl.gearWasControlled = gearWasControlled
            gearControl.gearMarkingIsCompliant = gearMarkingIsCompliant
            gearControl.averageWireThickness = averageWireThickness
            gearControl.wireType = wireType
            gearControl.comments = comments
        }
}
