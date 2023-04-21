package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UtilsUTests {

    @Test
    fun `removeRedundantFaoArea Should remove redundant fao codes`() {
        // Given
        val faoAreas = listOf(
            FAOArea(faoCode = "27.1.B", null, null),
            FAOArea(faoCode = "27.1", null, null),
            FAOArea(faoCode = "18", null, null),
            FAOArea(faoCode = "27.1.B.a", null, null),
            FAOArea(faoCode = null, null, null),
        )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(2)
        assertThat(filteredFaoAreas.first().faoCode).isEqualTo("18")
        assertThat(filteredFaoAreas.last().faoCode).isEqualTo("27.1.B.a")
    }

    @Test
    fun `removeRedundantFaoArea Should not remove redundant fao codes When fao code is not located at the start of the string`() {
        // Given
        val faoAreas = listOf(
            FAOArea(faoCode = "27", null, null),
            FAOArea(faoCode = "22.1.27", null, null),
            FAOArea(faoCode = "18", null, null),
        )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(3)
    }

    @Test
    fun `hasFaoCodeIncludedIn Should test fao areas included in another fao area`() {
        val faoAreaOne = FAOArea(faoCode = "27.1.B", null, null)
        assertThat(faoAreaOne.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaTwo = FAOArea(faoCode = "27.1", null, null)
        assertThat(faoAreaTwo.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaThree = FAOArea(faoCode = "28.1", null, null)
        assertThat(faoAreaThree.hasFaoCodeIncludedIn("27.1")).isFalse()

        val faoAreaFour = FAOArea(faoCode = "28.1.56", null, null)
        assertThat(faoAreaFour.hasFaoCodeIncludedIn("56")).isFalse()
    }
}
