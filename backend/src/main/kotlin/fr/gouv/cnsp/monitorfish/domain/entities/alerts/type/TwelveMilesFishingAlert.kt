package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class TwelveMilesFishingAlert (
        var seaFront: String? = null,
        var flagState: String? = null,
        var riskFactor: Double? = null
): AlertType(AlertTypeMapping.TWELVE_MILES_FISHING_ALERT, "2610")
