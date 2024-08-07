package fr.gouv.cnsp.monitorfish

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class UtilsUTests {
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
}
