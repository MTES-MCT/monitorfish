package fr.gouv.cnsp.monitorfish.domain.entities.alerts.type

import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
abstract class AlertType(
        val name: AlertTypeMapping
)
