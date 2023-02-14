package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class TwelveMilesFishingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.TWELVE_MILES_FISHING_ALERT, seaFront, dml, "2610")
