package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class FrenchEEZFishingAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.FRENCH_EEZ_FISHING_ALERT, seaFront, dml, 2608)
