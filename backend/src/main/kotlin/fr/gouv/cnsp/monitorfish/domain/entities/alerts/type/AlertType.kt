package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import com.fasterxml.jackson.annotation.JsonTypeInfo
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
abstract class AlertType(
    val type: AlertTypeMapping,
    open val seaFront: String? = null,
    open val dml: String? = null,
    override val natinfCode: String? = null,
) : ReportingValue(natinfCode)
