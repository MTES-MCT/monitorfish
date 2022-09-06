package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class MissingFARAlert(
  override var seaFront: String? = null,
  var flagState: String? = null,
  var riskFactor: Double? = null
) : AlertType(AlertTypeMapping.MISSING_FAR_ALERT, seaFront, "27689")
