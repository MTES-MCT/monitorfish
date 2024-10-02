package fr.gouv.cnsp.monitorfish

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class UtilsUTests {
    private val defaultStart = ZonedDateTime.parse("2024-01-01T12:00:00Z")
    private val defaultEnd = ZonedDateTime.parse("2024-01-01T14:00:00Z")

    @Test
    fun `areStringsEqual should always return true when both strings are null or emptyish`() {
        assertThat(Utils.areStringsEqual("", "")).isTrue()
        assertThat(Utils.areStringsEqual("  ", "")).isTrue()
        assertThat(Utils.areStringsEqual("", null)).isTrue()
        assertThat(Utils.areStringsEqual("  ", null)).isTrue()
        assertThat(Utils.areStringsEqual(null, null)).isTrue()
    }

    @Test
    fun `areStringsEqual should return true for equal trimmed strings`() {
        assertThat(Utils.areStringsEqual("  test  ", "test")).isTrue()
    }

    @Test
    fun `areStringsEqual should return false for non-equivalent strings`() {
        assertThat(Utils.areStringsEqual("Test", "test")).isFalse()
        assertThat(Utils.areStringsEqual("", "test")).isFalse()
        assertThat(Utils.areStringsEqual(null, "test")).isFalse()
    }

    @Test
    fun `isBetween Should return TRUE when CustomDateTime date is between start and end boundaries`() {
        // Given
        val start = ZonedDateTime.parse("2024-01-01T12:00:00Z")
        val end = ZonedDateTime.parse("2024-01-01T14:00:00Z")

        // When
        val result = Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T13:00:00Z"), start, end)

        // Then
        assertThat(result).isTrue
    }

    @Test
    fun `isBetween Should return FALSE when CustomDateTime date is outside the boundaries`() {
        // When
        val firstRresult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T11:00:00Z"), defaultStart, defaultEnd)

        // Then
        assertThat(firstRresult).isFalse

        // When
        val secondRresult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T15:00:00Z"), defaultStart, defaultEnd)

        // Then
        assertThat(secondRresult).isFalse
    }

    @Test
    fun `isBetween Should return FALSE when CustomDateTime date is on the boundary and isInclusive is FALSE`() {
        // Given
        val isInclusive = false

        // When
        val firstResult = Utils.isZonedDateTimeBetween(
            ZonedDateTime.parse("2024-01-01T12:00:00Z"),
            defaultStart,
            defaultEnd,
            isInclusive,
        )

        // Then
        assertThat(firstResult).isFalse

        // When
        val secondResult = Utils.isZonedDateTimeBetween(
            ZonedDateTime.parse("2024-01-01T14:00:00Z"),
            defaultStart,
            defaultEnd,
            isInclusive,
        )

        // Then
        assertThat(secondResult).isFalse
    }

    @Test
    fun `isBetween Should return TRUE when CustomDateTime date is on the boundary and isInclusive is TRUE`() {
        // Given
        val isInclusive = true

        // When
        val firstResult = Utils.isZonedDateTimeBetween(
            ZonedDateTime.parse("2024-01-01T12:00:00Z"),
            defaultStart,
            defaultEnd,
            isInclusive,
        )

        // Then
        assertThat(firstResult).isTrue

        // When
        val secondResult = Utils.isZonedDateTimeBetween(
            ZonedDateTime.parse("2024-01-01T14:00:00Z"),
            defaultStart,
            defaultEnd,
            isInclusive,
        )

        // Then
        assertThat(secondResult).isTrue
    }

    @Test
    fun `isBetween Should handle inclusive and exclusive boundaries as expected when boundaries are equal`() {
        // Given
        val start = ZonedDateTime.parse("2024-01-01T12:00:00Z")
        val end = ZonedDateTime.parse("2024-01-01T12:00:00Z")
        var isInclusive = false

        // When
        val firstResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T12:00:00Z"), start, end, isInclusive)

        // Then
        assertThat(firstResult).isFalse

        // Given
        isInclusive = true

        // When
        val secondResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T12:00:00Z"), start, end, isInclusive)

        // Then
        assertThat(secondResult).isTrue
    }

    @Test
    fun `isBetween Should handle different time zones correctly`() {
        // Given
        val start = ZonedDateTime.parse("2024-01-01T12:00:00+02:00")
        val end = ZonedDateTime.parse("2024-01-01T14:00:00+02:00")

        // When
        val firstResult = Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T13:00:00+02:00"), start, end)

        // Then
        assertThat(firstResult).isTrue

        // When
        val secondResult = Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T15:00:00+02:00"), start, end)

        // Then
        assertThat(secondResult).isFalse
    }

    @Test
    fun `isBetween Should handle milliseconds correctly`() {
        // When
        val firstResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T11:59:59.999Z"), defaultStart, defaultEnd)

        // Then
        assertThat(firstResult).isFalse

        // When
        val secondResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T12:00:00.001Z"), defaultStart, defaultEnd)

        // Then
        assertThat(secondResult).isTrue

        // When
        val thirdResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T13:59:59.999Z"), defaultStart, defaultEnd)

        // Then
        assertThat(thirdResult).isTrue

        // When
        val fourthResult =
            Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T14:00:00.001Z"), defaultStart, defaultEnd)

        // Then
        assertThat(fourthResult).isFalse
    }

    @Test
    fun `isBetween Should return FALSE when start is after end`() {
        // When
        val result = Utils.isZonedDateTimeBetween(ZonedDateTime.parse("2024-01-01T13:00:00Z"), defaultEnd, defaultStart)

        // Then
        assertThat(result).isFalse
    }
}
