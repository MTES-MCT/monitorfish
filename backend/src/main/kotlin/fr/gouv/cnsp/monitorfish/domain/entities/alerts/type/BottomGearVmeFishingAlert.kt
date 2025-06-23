package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class BottomGearVmeFishingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
    var depth: Double? = null,
) : AlertType(AlertTypeMapping.BOTTOM_GEAR_VME_FISHING_ALERT, seaFront, dml, 2610)
