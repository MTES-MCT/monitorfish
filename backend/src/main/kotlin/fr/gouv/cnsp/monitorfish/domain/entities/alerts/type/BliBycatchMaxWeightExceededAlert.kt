package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class BliBycatchMaxWeightExceededAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT, seaFront, dml, 12900)
