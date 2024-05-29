package fr.gouv.cnsp.monitorfish.domain.use_cases.faoAreas

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeFAOAreasFromCoordinates
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Point
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ComputeFAOAreasFromCoordinatesUTests {

    @MockBean
    private lateinit var faoAreasRepository: FAOAreasRepository

    @Test
    fun `execute Should create a point object`() {
        given(faoAreasRepository.findByIncluding(any())).willReturn(
            listOf(
                FAOArea("27.8.c"),
                FAOArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeFAOAreasFromCoordinates(faoAreasRepository).execute(12.5, 45.1)

        // Then
        assertThat(faoAreas).isNotEmpty()
        argumentCaptor<Point>().apply {
            verify(faoAreasRepository).findByIncluding(capture())

            assertThat(allValues.first().coordinate).isEqualTo(Coordinate(12.5, 45.1))
        }
    }
}
