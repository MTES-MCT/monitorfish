package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class MissingDEPAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.MISSING_DEP_ALERT, seaFront, dml, 27689)
