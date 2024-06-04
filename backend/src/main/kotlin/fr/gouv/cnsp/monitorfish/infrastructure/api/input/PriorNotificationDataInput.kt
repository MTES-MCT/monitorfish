package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class PriorNotificationDataInput(
    val logbookMessage: LogbookMessageValueForPnoDataInput,
    val tripGears: List<LogbookTripGearDataInput>,
    val vesselId: Int,
)
