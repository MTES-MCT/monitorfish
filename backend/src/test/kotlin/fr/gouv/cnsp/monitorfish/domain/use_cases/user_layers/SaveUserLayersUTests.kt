package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class SaveUserLayersUTests {
    @MockitoBean
    private lateinit var userLayersRepository: UserLayersRepository

    private val eezLayer = AdministrativeLayer(type = "eez_areas", zone = null)

    @Test
    fun `execute should replace the user layers, without duplicates`() {
        val result =
            SaveUserLayers(userLayersRepository)
                .execute(
                    "dummy@email.gouv.fr",
                    listOf(eezLayer, eezLayer),
                    listOf("7", "7"),
                    listOf("8", "8", "9"),
                    "DARK",
                )

        val expected =
            UserLayers(
                hashedEmail = hash("dummy@email.gouv.fr"),
                displayedAdministrativeLayers = listOf(eezLayer),
                displayedRegulatoryZoneIds = listOf("7"),
                selectedRegulatoryZoneIds = listOf("8", "9"),
                baseLayer = "DARK",
            )
        assertThat(result).isEqualTo(expected)
        verify(userLayersRepository).upsert(expected)
    }
}
