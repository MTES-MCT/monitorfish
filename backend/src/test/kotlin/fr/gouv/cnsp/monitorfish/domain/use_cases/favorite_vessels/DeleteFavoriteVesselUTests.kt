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
class DeleteFavoriteVesselUTests {
    @MockitoBean
    private lateinit var favoriteVesselsRepository: FavoriteVesselsRepository

    private val hashedEmail = hash("dummy@email.gouv.fr")

    private val phenomene =
        VesselIdentity(
            vesselId = 1,
            cfr = "FAK000999999",
            ircs = "CALLME",
            externalIdentification = "DONTSINK",
            name = "PHENOMENE",
            flagState = CountryCode.FR,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        )

    private val malotru =
        VesselIdentity(
            vesselId = 2,
            cfr = "U_W0NTFINDME",
            ircs = "QGDF",
            externalIdentification = "TALK2ME",
            name = "MALOTRU",
            flagState = CountryCode.ES,
            vesselIdentifier = null,
        )

    @Test
    fun `execute should remove the vessel and upsert the remaining favorite vessels`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail))
            .willReturn(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene, malotru)))

        val vessels = DeleteFavoriteVessel(favoriteVesselsRepository).execute("dummy@email.gouv.fr", phenomene)

        assertThat(vessels).containsExactly(malotru)
        verify(favoriteVesselsRepository).upsert(
            FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(malotru)),
        )
    }

    @Test
    fun `execute should upsert an empty list When the last favorite vessel is removed`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail))
            .willReturn(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene)))

        val vessels = DeleteFavoriteVessel(favoriteVesselsRepository).execute("dummy@email.gouv.fr", phenomene)

        assertThat(vessels).isEmpty()
        verify(favoriteVesselsRepository).upsert(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf()))
    }

    @Test
    fun `execute should remove the vessel When it is submitted with only its CFR identity`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail))
            .willReturn(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene, malotru)))

        val phenomeneRebuiltFromSearch =
            phenomene.copy(vesselId = null, ircs = null, externalIdentification = null, name = null)

        val vessels =
            DeleteFavoriteVessel(favoriteVesselsRepository).execute("dummy@email.gouv.fr", phenomeneRebuiltFromSearch)

        assertThat(vessels).containsExactly(malotru)
        verify(favoriteVesselsRepository).upsert(
            FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(malotru)),
        )
    }

    @Test
    fun `execute should leave the favorites unchanged When the vessel is not a favorite`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail))
            .willReturn(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene)))

        val vessels = DeleteFavoriteVessel(favoriteVesselsRepository).execute("dummy@email.gouv.fr", malotru)

        assertThat(vessels).containsExactly(phenomene)
        verify(favoriteVesselsRepository).upsert(
            FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene)),
        )
    }
}
