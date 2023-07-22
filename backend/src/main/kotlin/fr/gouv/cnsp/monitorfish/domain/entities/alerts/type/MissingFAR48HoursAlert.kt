package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class MissingFAR48HoursAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.MISSING_FAR_48_HOURS_ALERT, seaFront, dml, 27689)
