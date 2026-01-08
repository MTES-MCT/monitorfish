package fr.gouv.cnsp.monitorfish.domain.entities.reporting

abstract class AlertAndReportingValue(
    open val natinfCode: Int? = null,
    open val threat: String? = null,
    open val threatCharacterization: String? = null,
)
