package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.FaoAreaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.Point
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ComputeFaoAreasFromCoordinatesUTests {

    @MockBean
    private lateinit var faoAreaRepository: FaoAreaRepository

    @Test
    fun `execute Should create a point object`() {
        given(faoAreaRepository.findByIncluding(any())).willReturn(
            listOf(
                FaoArea("27.8.c"),
                FaoArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeFaoAreasFromCoordinates(faoAreaRepository).execute(12.5, 45.1)

        // Then
        assertThat(faoAreas).isNotEmpty()
        argumentCaptor<Point>().apply {
            verify(faoAreaRepository).findByIncluding(capture())

            assertThat(allValues.first().coordinate).isEqualTo(Coordinate(12.5, 45.1))
        }
    }
}
