package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetUserLayersUTests {
    @MockitoBean
    private lateinit var userLayersRepository: UserLayersRepository

    private val hashedEmail = hash("dummy@email.gouv.fr")

    @Test
    fun `execute should return the user layers of the hashed email`() {
        val userLayers =
            UserLayers(
                hashedEmail = hashedEmail,
                administrativeLayers = listOf(AdministrativeLayer(type = "eez_areas", zone = null)),
                showedRegulatoryZoneIds = listOf("8"),
                selectedRegulatoryZoneIds = listOf("8"),
                baseLayer = "SATELLITE",
            )
        given(userLayersRepository.findByHashedEmail(hashedEmail)).willReturn(userLayers)

        val result = GetUserLayers(userLayersRepository).execute("dummy@email.gouv.fr")

        assertThat(result).isEqualTo(userLayers)
    }

    @Test
    fun `execute should return null When the user has no layers record`() {
        given(userLayersRepository.findByHashedEmail(hashedEmail)).willReturn(null)

        assertThat(GetUserLayers(userLayersRepository).execute("dummy@email.gouv.fr")).isNull()
    }
}
