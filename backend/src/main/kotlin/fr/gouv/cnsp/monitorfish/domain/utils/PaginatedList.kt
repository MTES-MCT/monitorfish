package fr.gouv.cnsp.monitorfish.domain.utils

import kotlin.math.floor

data class PaginatedList<Entity, ExtraData>(
    val data: List<Entity>,
    val extraData: ExtraData,
    val lastPageNumber: Int,
    val pageNumber: Int,
    val pageSize: Int,
    val totalLength: Int,
) {
    companion object {
        fun <Entity, ExtraData> new(
            items: List<Entity>,
            /** Page number (0-indexed). */
            pageNumber: Int,
            /** Number of items per page. */
            pageSize: Int,
            extraData: ExtraData,
        ): PaginatedList<Entity, ExtraData> {
            val paginatedItems = items.drop(pageNumber * pageSize).take(pageSize)
            val totalLength = items.size
            val lastPageNumber = floor((totalLength / pageSize).toDouble()).toInt()

            return PaginatedList(
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
