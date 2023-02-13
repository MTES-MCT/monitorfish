package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class ThreeMilesTrawlingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT, seaFront, dml, "7059")
