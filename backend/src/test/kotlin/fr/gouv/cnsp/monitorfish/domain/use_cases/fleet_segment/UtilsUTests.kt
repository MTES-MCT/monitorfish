package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UtilsUTests {
    @Test
    fun `removeRedundantFaoArea Should remove redundant fao codes`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1"),
                FaoArea(faoCode = "27.1"),
                FaoArea(faoCode = "18"),
                FaoArea(faoCode = "27.1.B.a"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(2)
        assertThat(filteredFaoAreas.first().faoCode).isEqualTo("18")
        assertThat(filteredFaoAreas.last().faoCode).isEqualTo("27.1.B.a")
    }

    @Test
    fun `removeRedundantFaoArea Should keep different fao codes`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.C"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(2)
        assertThat(filteredFaoAreas.first().faoCode).isEqualTo("27.1.B")
        assertThat(filteredFaoAreas.last().faoCode).isEqualTo("27.1.C")
    }

    @Test
    fun `removeRedundantFaoArea Should not remove redundant fao codes When fao code is not located at the start of the string`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27"),
                FaoArea(faoCode = "22.1.27"),
                FaoArea(faoCode = "18"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(3)
    }

    @Test
    fun `hasFaoCodeIncludedIn Should test fao areas included in another fao area`() {
        val faoAreaOne = FaoArea(faoCode = "27.1.B")
        assertThat(faoAreaOne.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaTwo = FaoArea(faoCode = "27.1")
        assertThat(faoAreaTwo.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaThree = FaoArea(faoCode = "28.1")
        assertThat(faoAreaThree.hasFaoCodeIncludedIn("27.1")).isFalse()

        val faoAreaFour = FaoArea(faoCode = "28.1.56")
        assertThat(faoAreaFour.hasFaoCodeIncludedIn("56")).isFalse()
    }
}
