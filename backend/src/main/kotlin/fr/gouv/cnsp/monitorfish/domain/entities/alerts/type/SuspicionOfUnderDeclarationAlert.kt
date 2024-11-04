package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

class SuspicionOfUnderDeclarationAlert(
    override var seaFront: String? = null,
    override var dml: String? = null,
    var riskFactor: Double? = null,
) : AlertType(AlertTypeMapping.SUSPICION_OF_UNDER_DECLARATION_ALERT, seaFront, dml, 27689)
