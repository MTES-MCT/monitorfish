package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class MissingFARAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.MISSING_FAR_ALERT, seaFront, dml, "27689")
