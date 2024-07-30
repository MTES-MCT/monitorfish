package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.GetFAOAreas
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetFAOAreasUTests {

    @MockBean
    private lateinit var faoAreasRepository: FAOAreasRepository

    @Test
    fun `execute Should return a concatenated list of FAO properties`() {
        // Given
        given(faoAreasRepository.findAll()).willReturn(
            listOf(
                FAOArea("27.1"),
                FAOArea("27.1.0"),
                FAOArea("28.1"),
                FAOArea("28.1.0"),
                FAOArea("28.1.1"),
            ),
        )

        // When
        val faoList = GetFAOAreas(faoAreasRepository).execute()

        // Then
        assertThat(faoList).hasSize(5)
        assertThat(faoList[0]).isEqualTo("27.1")
        assertThat(faoList[1]).isEqualTo("27.1.0")
        assertThat(faoList[2]).isEqualTo("28.1")
        assertThat(faoList[3]).isEqualTo("28.1.0")
        assertThat(faoList[4]).isEqualTo("28.1.1")
    }
}
