package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class NeafcFishingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.NEAFC_FISHING_ALERT, seaFront, dml, 2610)
