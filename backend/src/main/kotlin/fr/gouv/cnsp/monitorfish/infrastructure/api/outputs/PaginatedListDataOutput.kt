package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

data class PaginatedListDataOutput<ItemDataOutput, ExtraDataOutput>(
    val data: List<ItemDataOutput>,
    val extraData: ExtraDataOutput,
    val lastPageNumber: Int,
    /** Page number (0-indexed). */
    val pageNumber: Int,
    /** Number of items per page. */
    val pageSize: Int,
    val totalLength: Int,
)
