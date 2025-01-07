package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl

data class GearControlDataInput (
    val gearCode: String,
    val gearName: String?,
    val declaredMesh: Double?,
    val controlledMesh: Double?,
    val hasUncontrolledMesh: Boolean?,
    val gearWasControlled: Boolean?,
    val comments: String?,
) {
    fun toGearControl() = GearControl().also { gearControl ->
        gearControl.gearCode = gearCode
        gearControl.gearName = gearName
        gearControl.declaredMesh = declaredMesh
        gearControl.controlledMesh = controlledMesh
        gearControl.hasUncontrolledMesh = hasUncontrolledMesh ?: false
        gearControl.gearWasControlled = gearWasControlled
        gearControl.comments = comments
    }
}
