package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class FrenchEEZFishingAlert (
        override var seaFront: String? = null,
        var flagState: String? = null,
        var riskFactor: Double? = null
): AlertType(AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT, seaFront, "2608")
