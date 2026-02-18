package fr.gouv.cnsp.monitorfish.domain.entities.facade

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SeafrontGroupUTests {
    @Test
    fun `fromSeafront should return the correct SeafrontGroup with a non-null seafront`() {
        // Given
        val seafront = Seafront.CORSE

        // When
        val result = SeafrontGroup.fromSeafront(seafront)

        // Then
        assertThat(result).isEqualTo(SeafrontGroup.MED)
    }

    @Test
    fun `fromSeafront should return NO_FACADE with a null seafront`() {
        // When
        val result = SeafrontGroup.fromSeafront(null)

        // Then
        assertThat(result).isEqualTo(SeafrontGroup.NO_FACADE)
    }

    @Test
    fun `hasSeafront should return true for ALL group with a non-null seafront`() {
        // Given
        val seafront = Seafront.CORSE

        // When
        val result = SeafrontGroup.ALL.hasSeafront(seafront)

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `hasSeafront should return true for ALL group with a null seafront`() {
        // Given
        val seafront = null

        // When
        val result = SeafrontGroup.ALL.hasSeafront(seafront)

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `hasSeafront should return false for NO_FACADE group with a non-null seafront`() {
        // Given
        val seafront = Seafront.CORSE

        // When
        val result = SeafrontGroup.NO_FACADE.hasSeafront(seafront)

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `hasSeafront should return true for NO_FACADE group with a null seafront`() {
        // When
        val result = SeafrontGroup.NO_FACADE.hasSeafront(null)

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `hasSeafront should return true for MED group with a MED seafront`() {
        // Given
        val seafront = Seafront.MED

        // When
        val result = SeafrontGroup.MED.hasSeafront(seafront)

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `hasSeafront should return false for MED group with a non-MED seafront`() {
        // Given
        val seafront = Seafront.GUADELOUPE

        // When
        val result = SeafrontGroup.MED.hasSeafront(seafront)

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `toSeafronts should return the correct list of seafronts for a group`() {
        // When
        val result = SeafrontGroup.OUTREMEROA.toSeafronts()

        // Then
        assertThat(result).containsExactlyInAnyOrder(
            Seafront.SAINT_PIERRE_MIQUELON,
            Seafront.SAINT_MARTIN,
            Seafront.SAINT_BARTHELEMY,
            Seafront.GUADELOUPE,
            Seafront.GUYANE,
            Seafront.MARTINIQUE,
        )
    }

    @Test
    fun `toSeafronts should return POLYNESIE_CLIPPERTON for NO_FACADE group`() {
        // When
        val result = SeafrontGroup.NO_FACADE.toSeafronts()

        // Then
        assertThat(result).containsExactlyInAnyOrder(Seafront.POLYNESIE_CLIPPERTON)
    }
}
