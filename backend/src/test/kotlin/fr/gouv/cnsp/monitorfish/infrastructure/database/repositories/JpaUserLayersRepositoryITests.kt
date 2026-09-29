package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaUserLayersRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaUserLayersRepository: JpaUserLayersRepository

    @Test
    @Transactional
    fun `findByHashedEmail Should return the user layers of the non-super user`() {
        // Given the dummy data of V666_44__Insert_dummy_user_layers
        val hashedEmail = hash("another@email.com")

        // When
        val userLayers = jpaUserLayersRepository.findByHashedEmail(hashedEmail)

        // Then
        assertThat(userLayers).isNotNull()
        assertThat(userLayers!!.hashedEmail).isEqualTo(hashedEmail)
        assertThat(
            userLayers.displayedAdministrativeLayers,
        ).containsExactly(AdministrativeLayer(type = "eez_areas", zone = null))
        assertThat(userLayers.displayedRegulatoryZoneIds).containsExactly("8")
        assertThat(userLayers.selectedRegulatoryZoneIds).containsExactly("8")
        assertThat(userLayers.baseLayer).isEqualTo("SATELLITE")
    }

    @Test
    @Transactional
    fun `findByHashedEmail Should return null When the user has no layers record`() {
        assertThat(jpaUserLayersRepository.findByHashedEmail(hash("dummy@email.gouv.fr"))).isNull()
    }

    @Test
    @Transactional
    fun `upsert Should insert then replace the user layers`() {
        // Given
        val hashedEmail = hash("new-user@email.gouv.fr")
        val userLayers =
            UserLayers(
                hashedEmail = hashedEmail,
                displayedAdministrativeLayers = listOf(AdministrativeLayer(type = "3_miles_areas", zone = null)),
                displayedRegulatoryZoneIds = listOf("9"),
                selectedRegulatoryZoneIds = listOf("9"),
                baseLayer = null,
            )

        // When
        jpaUserLayersRepository.upsert(userLayers)

        // Then
        assertThat(jpaUserLayersRepository.findByHashedEmail(hashedEmail)).isEqualTo(userLayers)

        // When
        val updatedUserLayers = userLayers.copy(displayedAdministrativeLayers = listOf(), baseLayer = "DARK")
        jpaUserLayersRepository.upsert(updatedUserLayers)

        // Then
        assertThat(jpaUserLayersRepository.findByHashedEmail(hashedEmail)).isEqualTo(updatedUserLayers)
    }
}
