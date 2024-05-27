package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import kotlin.math.floor

data class PaginatedListDataOutput<ItemDataOutput, ExtraDataOutput>(
    val data: List<ItemDataOutput> = emptyList(),
    val extraData: ExtraDataOutput? = null,
    val lastPageNumber: Int = 0,
    val pageNumber: Int = 0,
    val pageSize: Int = 0,
    val totalLength: Int = 0,
) {
    companion object {
        fun <CollectionItemDataOutput, ExtraDataOutput> fromListDataOutput(
            items: List<CollectionItemDataOutput>,
            /** Page number (0-indexed). */
            pageNumber: Int,
            /** Number of items per page. */
            pageSize: Int,
            extraData: ExtraDataOutput?,
        ): PaginatedListDataOutput<CollectionItemDataOutput, ExtraDataOutput> {
            val paginatedItems = items.drop(pageNumber * pageSize).take(pageSize)
            val totalLength = items.size
            val lastPageNumber = floor((totalLength / pageSize).toDouble()).toInt()

            return PaginatedListDataOutput(
                data = paginatedItems,
                extraData,
                lastPageNumber,
                pageNumber,
                pageSize,
                totalLength,
            )
        }
    }
}
