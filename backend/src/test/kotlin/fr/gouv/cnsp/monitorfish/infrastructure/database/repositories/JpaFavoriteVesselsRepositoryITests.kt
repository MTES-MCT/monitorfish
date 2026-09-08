package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.hash
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

class JpaFavoriteVesselsRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaFavoriteVesselsRepository: JpaFavoriteVesselsRepository

    @Test
    @Transactional
    fun `findAllByHashedEmail Should return the favorite vessels of the super-user`() {
        // Given the dummy data of V666_43__Insert_dummy_favorite_vessels
        val hashedEmail = hash("dummy@email.gouv.fr")

        // When
        val favoriteVessels = jpaFavoriteVesselsRepository.findAllByHashedEmail(hashedEmail)

        // Then
        assertThat(favoriteVessels).isNotNull()
        assertThat(favoriteVessels!!.hashedEmail).isEqualTo(hashedEmail)
        assertThat(favoriteVessels.vessels).hasSize(2)
        assertThat(favoriteVessels.vessels.map { it.name }).containsExactly("PHENOMENE", "MALOTRU")
        assertThat(favoriteVessels.vessels.first().cfr).isEqualTo("FAK000999999")
        assertThat(favoriteVessels.vessels.first().flagState).isEqualTo(CountryCode.FR)
    }

    @Test
    @Transactional
    fun `findAllByHashedEmail Should return the single favorite vessel of the non-super user`() {
        // When
        val favoriteVessels = jpaFavoriteVesselsRepository.findAllByHashedEmail(hash("another@email.com"))

        // Then
        assertThat(favoriteVessels).isNotNull()
        assertThat(favoriteVessels!!.vessels).hasSize(1)
        assertThat(favoriteVessels.vessels.first().name).isEqualTo("LE b@TO")
    }

    @Test
    @Transactional
    fun `findAllByHashedEmail Should return null When the user has no favorite vessels`() {
        assertThat(jpaFavoriteVesselsRepository.findAllByHashedEmail(hash("unknown@email.gouv.fr"))).isNull()
    }

    @Test
    @Transactional
    fun `upsert Should insert a new favorite vessels record`() {
        // Given
        val hashedEmail = hash("new-user@email.gouv.fr")
        assertThat(jpaFavoriteVesselsRepository.findAllByHashedEmail(hashedEmail)).isNull()
        val vessel =
            VesselIdentity(
                vesselId = 6,
                cfr = "ABC000939217",
                ircs = "SC6082",
                externalIdentification = "RU460262",
                name = "FRAIS AVIS MODE",
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        // When
        jpaFavoriteVesselsRepository.upsert(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(vessel)))

        // Then
        val saved = jpaFavoriteVesselsRepository.findAllByHashedEmail(hashedEmail)
        assertThat(saved).isNotNull()
        assertThat(saved!!.vessels).containsExactly(vessel)
    }

    @Test
    @Transactional
    fun `upsert Should replace the vessels list of an existing record`() {
        // Given
        val hashedEmail = hash("dummy@email.gouv.fr")
        assertThat(jpaFavoriteVesselsRepository.findAllByHashedEmail(hashedEmail)!!.vessels).hasSize(2)
        val onlyVessel =
            VesselIdentity(
                vesselId = 3,
                cfr = "FR263418260",
                ircs = "IR12A",
                externalIdentification = "08FR65324",
                name = "LE b@TO",
                flagState = CountryCode.FR,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )

        // When
        jpaFavoriteVesselsRepository.upsert(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(onlyVessel)))

        // Then
        val updated = jpaFavoriteVesselsRepository.findAllByHashedEmail(hashedEmail)
        assertThat(updated!!.vessels).containsExactly(onlyVessel)
    }
}
