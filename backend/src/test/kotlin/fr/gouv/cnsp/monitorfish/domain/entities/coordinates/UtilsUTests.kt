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
        val result = transformCoordinates(47.8979431461615, -4.09068770830146)

        // Then
        assertThat(result.first).isEqualTo(5331974.641075866)
        assertThat(result.second).isEqualTo(-455760.63518883364)
    }
}
