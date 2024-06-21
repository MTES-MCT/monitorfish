package fr.gouv.cnsp.monitorfish.domain.utils

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

data class FakeCollectionItem(
    val id: Int,
    val name: String,
)

data class FakeCollectionExtraData(
    val extraProp: Int,
)

class PaginatedListUTests {
    @Test
    fun `new Should return the expected list from the first page`() {
        // Given
        val items = listOf(
            FakeCollectionItem(1, "Item 1"),
            FakeCollectionItem(2, "Item 2"),
            FakeCollectionItem(3, "Item 3"),
            FakeCollectionItem(4, "Item 4"),
            FakeCollectionItem(5, "Item 5"),
        )
        val pageNumber = 0
        val pageSize = 2
        val extraData = FakeCollectionExtraData(extraProp = 42)

        // When
        val result = PaginatedList.new(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedList(
                data = listOf(
                    FakeCollectionItem(1, "Item 1"),
                    FakeCollectionItem(2, "Item 2"),
                ),
                extraData = extraData,
                lastPageNumber = 2,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 5,
            ),
        )
    }

    @Test
    fun `new Should return an empty list when retrieving an empty list`() {
        // Given
        val items = emptyList<FakeCollectionItem>()
        val pageNumber = 0
        val pageSize = 2
        val extraData = FakeCollectionExtraData(extraProp = 42)

        // When
        val result = PaginatedList.new(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedList(
                data = emptyList<FakeCollectionItem>(),
                extraData = extraData,
                lastPageNumber = 0,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 0,
            ),
        )
    }

    @Test
    fun `new Should return the expected list from the last page`() {
        // Given
        val items = listOf(
            FakeCollectionItem(1, "Item 1"),
            FakeCollectionItem(2, "Item 2"),
            FakeCollectionItem(3, "Item 3"),
            FakeCollectionItem(4, "Item 4"),
            FakeCollectionItem(5, "Item 5"),
        )
        val pageNumber = 2
        val pageSize = 2
        val extraData = FakeCollectionExtraData(extraProp = 42)

        // When
        val result = PaginatedList.new(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedList(
                data = listOf(FakeCollectionItem(5, "Item 5")),
                extraData = extraData,
                lastPageNumber = 2,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 5,
            ),
        )
    }

    @Test
    fun `new Should return an empty list when the page number exceeds the last page number`() {
        // Given
        val items = listOf(
            FakeCollectionItem(1, "Item 1"),
            FakeCollectionItem(2, "Item 2"),
            FakeCollectionItem(3, "Item 3"),
        )
        val pageNumber = 2
        val pageSize = 2
        val extraData = FakeCollectionExtraData(extraProp = 42)

        // When
        val result = PaginatedList.new(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedList(
                data = emptyList<FakeCollectionItem>(),
                extraData = extraData,
                lastPageNumber = 1,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 3,
            ),
        )
    }

    @Test
    fun `new Should return null extra data when there is none`() {
        // Given
        val items = listOf(
            FakeCollectionItem(1, "Item 1"),
            FakeCollectionItem(2, "Item 2"),
            FakeCollectionItem(3, "Item 3"),
        )
        val pageNumber = 1
        val pageSize = 2

        // When
        val result = PaginatedList.new(items, pageNumber, pageSize, null)

        // Then
        assertThat(result).isEqualTo(
            PaginatedList(
                data = listOf(FakeCollectionItem(3, "Item 3")),
                extraData = null,
                lastPageNumber = 1,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 3,
            ),
        )
    }
}
