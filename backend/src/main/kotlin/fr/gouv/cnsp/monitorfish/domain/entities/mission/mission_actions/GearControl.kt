package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

class GearControl {
    var gearCode: String? = null
    var gearName: String? = null
    var declaredMesh: Double? = null
    var controlledMesh: Double? = null
    var hasUncontrolledMesh: Boolean = false
    var gearWasControlled: Boolean? = null
    var gearMarkingIsCompliant: ControlCheck? = null
    var averageWireThickness: Double? = null
    var wireType: WireType? = null
    var comments: String? = null
}
