package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils

import org.junit.jupiter.api.Test

class ToSqlArrayStringUTests {
    @Test
    fun `toSqlArrayString Should return a valid SQL array string`() {
        // Given
        val list = listOf("a", "b", "c")

        // When
        val result = toSqlArrayString(list)

        // Then
        assert(result == "{a,b,c}")
    }

    @Test
    fun `toSqlArrayString Should return null when the list is null`() {
        // Given
        val list = null

        // When
        val result = toSqlArrayString(list)

        // Then
        assert(result == null)
    }
}
