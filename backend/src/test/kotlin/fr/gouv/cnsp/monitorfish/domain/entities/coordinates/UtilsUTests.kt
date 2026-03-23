package fr.gouv.cnsp.monitorfish.domain.entities.coordinates

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UtilsUTests {
    @Test
    fun `transformCoordinates Should return a transformed coordinates`() {
        // When
        val result = transformCoordinatesToOpenlayersProjection(47.8979431461615, -4.09068770830146)

        // Then
        assertThat(result!!.first).isEqualTo(5331974.641075866)
        assertThat(result.second).isEqualTo(-455760.63518883364)
    }

    @Test
    fun `transformCoordinates Should return null When latitude is out of range`() {
        // When
        val result = transformCoordinatesToOpenlayersProjection(-256.0521, -128.0521)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `transformCoordinates Should return null When longitude is out of range`() {
        // When
        val result = transformCoordinatesToOpenlayersProjection(200.0, 45.0)

        // Then
        assertThat(result).isNull()
    }
}
