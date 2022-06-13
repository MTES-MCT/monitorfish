package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class ThreeMilesTrawlingAlert (
        override var seaFront: String? = null,
        var flagState: String? = null,
        var riskFactor: Double? = null
): AlertType(AlertTypeMapping.THREE_MILES_TRAWLING_ALERT, seaFront, "7059")
