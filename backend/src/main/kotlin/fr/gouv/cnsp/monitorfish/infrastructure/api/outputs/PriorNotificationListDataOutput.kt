package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

class PriorNotificationListDataOutput(
    val data: List<PriorNotificationDataOutput>,
    val lastPageNumber: Int,
    val pageNumber: Int,
    val pageSize: Int,
    val totalLength: Int,
)
