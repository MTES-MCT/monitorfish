package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANCatches

class PNOAndLANWeightToleranceAlert(
    var lanOperationNumber: String? = null,
    var pnoOperationNumber: String? = null,
    var percentOfTolerance: Double? = null,
    var minimumWeightThreshold: Double? = null,
    var catchesOverTolerance: List<PNOAndLANCatches>? = listOf(),
) : AlertType(AlertTypeMapping.PNO_LAN_WEIGHT_TOLERANCE_ALERT)
