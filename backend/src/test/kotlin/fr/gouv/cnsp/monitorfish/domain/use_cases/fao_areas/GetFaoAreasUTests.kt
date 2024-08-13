package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetFaoAreasUTests {
    @MockBean
    private lateinit var faoAreaRepository: FaoAreaRepository

    @Test
    fun `execute Should return a concatenated list of FAO properties`() {
        // Given
        given(faoAreaRepository.findAllSortedByUsage()).willReturn(
            listOf(
                FaoArea("27.1"),
                FaoArea("27.1.0"),
                FaoArea("28.1"),
                FaoArea("28.1.0"),
                FaoArea("28.1.1"),
            ),
        )

        // When
        val faoList = GetFaoAreas(faoAreaRepository).execute()

        // Then
        assertThat(faoList).hasSize(5)
        assertThat(faoList[0]).isEqualTo("27.1")
        assertThat(faoList[1]).isEqualTo("27.1.0")
        assertThat(faoList[2]).isEqualTo("28.1")
        assertThat(faoList[3]).isEqualTo("28.1.0")
        assertThat(faoList[4]).isEqualTo("28.1.1")
    }
}
