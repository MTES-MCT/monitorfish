package fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.never
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
class InitFavoriteVesselsUTests {
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
    fun `execute should create the favorite vessels record from the given list When none exists yet`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail)).willReturn(null)

        val vessels =
            InitFavoriteVessels(favoriteVesselsRepository)
                .execute("dummy@email.gouv.fr", listOf(phenomene, malotru))

        assertThat(vessels).containsExactly(phenomene, malotru)
        verify(favoriteVesselsRepository).upsert(
            FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene, malotru)),
        )
    }

    @Test
    fun `execute should deduplicate the given list`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail)).willReturn(null)

        val vessels =
            InitFavoriteVessels(favoriteVesselsRepository)
                .execute("dummy@email.gouv.fr", listOf(phenomene, malotru, phenomene))

        assertThat(vessels).containsExactly(phenomene, malotru)
        verify(favoriteVesselsRepository).upsert(
            FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(phenomene, malotru)),
        )
    }

    @Test
    fun `execute should keep the existing record untouched When the user already has favorite vessels`() {
        given(favoriteVesselsRepository.findAllByHashedEmail(hashedEmail))
            .willReturn(FavoriteVessels(hashedEmail = hashedEmail, vessels = listOf(malotru)))

        val vessels =
            InitFavoriteVessels(favoriteVesselsRepository)
                .execute("dummy@email.gouv.fr", listOf(phenomene))

        assertThat(vessels).containsExactly(malotru)
        verify(favoriteVesselsRepository, never()).upsert(any())
    }
}
