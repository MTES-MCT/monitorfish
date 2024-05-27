package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

data class FakeItemDataOutput(
    val id: Int,
    val name: String,
)

data class FakeExtraDataOutput(
    val extraProp: Int,
)

class PaginatedListDataOutputUTests {
    @Test
    fun `fromListDataOutput Should return the expected list from the first page`() {
        // Given
        val items = listOf(
            FakeItemDataOutput(1, "Item 1"),
            FakeItemDataOutput(2, "Item 2"),
            FakeItemDataOutput(3, "Item 3"),
            FakeItemDataOutput(4, "Item 4"),
            FakeItemDataOutput(5, "Item 5"),
        )
        val pageNumber = 0
        val pageSize = 2
        val extraData = FakeExtraDataOutput(extraProp = 42)

        // When
        val result = PaginatedListDataOutput.fromListDataOutput(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedListDataOutput(
                data = listOf(
                    FakeItemDataOutput(1, "Item 1"),
                    FakeItemDataOutput(2, "Item 2"),
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
    fun `fromListDataOutput Should return an empty list when retrieving an empty list`() {
        // Given
        val items = emptyList<FakeItemDataOutput>()
        val pageNumber = 0
        val pageSize = 2
        val extraData = FakeExtraDataOutput(extraProp = 42)

        // When
        val result = PaginatedListDataOutput.fromListDataOutput(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedListDataOutput(
                data = emptyList<FakeItemDataOutput>(),
                extraData = extraData,
                lastPageNumber = 0,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 0,
            ),
        )
    }

    @Test
    fun `fromListDataOutput Should return the expected list from the last page`() {
        // Given
        val items = listOf(
            FakeItemDataOutput(1, "Item 1"),
            FakeItemDataOutput(2, "Item 2"),
            FakeItemDataOutput(3, "Item 3"),
            FakeItemDataOutput(4, "Item 4"),
            FakeItemDataOutput(5, "Item 5"),
        )
        val pageNumber = 2
        val pageSize = 2
        val extraData = FakeExtraDataOutput(extraProp = 42)

        // When
        val result = PaginatedListDataOutput.fromListDataOutput(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedListDataOutput(
                data = listOf(FakeItemDataOutput(5, "Item 5")),
                extraData = extraData,
                lastPageNumber = 2,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 5,
            ),
        )
    }

    @Test
    fun `fromListDataOutput Should return an empty list when the page number exceeds the last page number`() {
        // Given
        val items = listOf(
            FakeItemDataOutput(1, "Item 1"),
            FakeItemDataOutput(2, "Item 2"),
            FakeItemDataOutput(3, "Item 3"),
        )
        val pageNumber = 2
        val pageSize = 2
        val extraData = FakeExtraDataOutput(extraProp = 42)

        // When
        val result = PaginatedListDataOutput.fromListDataOutput(items, pageNumber, pageSize, extraData)

        // Then
        assertThat(result).isEqualTo(
            PaginatedListDataOutput(
                data = emptyList<FakeItemDataOutput>(),
                extraData = extraData,
                lastPageNumber = 1,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 3,
            ),
        )
    }

    @Test
    fun `fromListDataOutput Should return null extra data when there is none`() {
        // Given
        val items = listOf(
            FakeItemDataOutput(1, "Item 1"),
            FakeItemDataOutput(2, "Item 2"),
            FakeItemDataOutput(3, "Item 3"),
        )
        val pageNumber = 1
        val pageSize = 2

        // When
        val result = PaginatedListDataOutput.fromListDataOutput(items, pageNumber, pageSize, null)

        // Then
        assertThat(result).isEqualTo(
            PaginatedListDataOutput(
                data = listOf(FakeItemDataOutput(3, "Item 3")),
                extraData = null,
                lastPageNumber = 1,
                pageNumber = pageNumber,
                pageSize = pageSize,
                totalLength = 3,
            ),
        )
    }
}
