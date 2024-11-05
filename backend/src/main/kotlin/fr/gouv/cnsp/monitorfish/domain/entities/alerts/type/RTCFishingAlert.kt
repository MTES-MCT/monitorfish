package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class RTCFishingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.RTC_FISHING_ALERT, seaFront, dml, 2596)
