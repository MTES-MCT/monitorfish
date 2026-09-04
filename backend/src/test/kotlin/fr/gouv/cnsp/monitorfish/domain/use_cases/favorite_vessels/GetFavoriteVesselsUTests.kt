package fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.FavoriteVesselsRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetFavoriteVesselsUTests {
    @MockitoBean
    private lateinit var favoriteVesselsRepository: FavoriteVesselsRepository

    private val vessel =
        VesselIdentity(
            vesselId = 1,
            cfr = "FAK000999999",
            ircs = "CALLME",
            externalIdentification = "DONTSINK",
            name = "PHENOMENE",
            flagState = CountryCode.FR,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        )

    @Test
    fun `execute should return the favorite vessels of the hashed email`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hash("dummy@email.gouv.fr")))
            .willReturn(FavoriteVessels(hashedEmail = hash("dummy@email.gouv.fr"), vessels = listOf(vessel)))

        val vessels = GetFavoriteVessels(favoriteVesselsRepository).execute("dummy@email.gouv.fr")

        assertThat(vessels).containsExactly(vessel)
        verify(favoriteVesselsRepository).findAllByHashedEmail(hash("dummy@email.gouv.fr"))
    }

    @Test
    fun `execute should return an empty list When the user has no favorite vessels record`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hash("dummy@email.gouv.fr"))).willReturn(null)

        val vessels = GetFavoriteVessels(favoriteVesselsRepository).execute("dummy@email.gouv.fr")

        assertThat(vessels).isEmpty()
    }
}
