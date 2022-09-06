package fr.gouv.cnsp.monitorfish.domain.helpers

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class GeoHelpersUTests {
    @Test
    fun `degreeMinuteToLatLong should return decimal for a north latitude`() {
        assertThat(degreeMinuteToDecimal("N", 45, 33)).isEqualTo(45.55)
    }

    @Test
    fun `degreeMinuteToLatLong should return decimal for a south latitude`() {
        assertThat(degreeMinuteToDecimal("S", 23, 44)).isEqualTo(-23.733333333333334)
    }

    @Test
    fun `degreeMinuteToLatLong should return decimal for an east longitude`() {
        assertThat(degreeMinuteToDecimal("E", 166, 0)).isEqualTo(166.0)
    }

    @Test
    fun `degreeMinuteToLatLong should return decimal for a west longitude`() {
        assertThat(degreeMinuteToDecimal("W", 44, 11)).isEqualTo(-44.18333333333333)
    }
}
