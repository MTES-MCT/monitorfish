package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
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
class InitUserLayersUTests {
    @MockitoBean
    private lateinit var userLayersRepository: UserLayersRepository

    private val hashedEmail = hash("dummy@email.gouv.fr")

    private val eezLayer = AdministrativeLayer(type = "eez_areas", zone = null)

    private fun initUserLayers() = InitUserLayers(userLayersRepository, SaveUserLayers(userLayersRepository))

    @Test
    fun `execute should create the user layers record When none exists yet`() {
        given(userLayersRepository.findByHashedEmail(hashedEmail)).willReturn(null)

        val result = initUserLayers().execute("dummy@email.gouv.fr", listOf(eezLayer), listOf("7"), listOf("8"), "DARK")

        val expected =
            UserLayers(
                hashedEmail = hashedEmail,
                displayedAdministrativeLayers = listOf(eezLayer),
                displayedRegulatoryZoneIds = listOf("7"),
                selectedRegulatoryZoneIds = listOf("8"),
                baseLayer = "DARK",
            )
        assertThat(result).isEqualTo(expected)
        verify(userLayersRepository).upsert(expected)
    }

    @Test
    fun `execute should keep the existing record untouched When the user already has layers`() {
        val existing =
            UserLayers(
                hashedEmail = hashedEmail,
                displayedAdministrativeLayers = listOf(),
                displayedRegulatoryZoneIds = listOf(),
                selectedRegulatoryZoneIds = listOf("9"),
                baseLayer = null,
            )
        given(userLayersRepository.findByHashedEmail(hashedEmail)).willReturn(existing)

        val result = initUserLayers().execute("dummy@email.gouv.fr", listOf(eezLayer), listOf("7"), listOf("8"), "DARK")

        assertThat(result).isEqualTo(existing)
        verify(userLayersRepository, never()).upsert(any())
    }
}
