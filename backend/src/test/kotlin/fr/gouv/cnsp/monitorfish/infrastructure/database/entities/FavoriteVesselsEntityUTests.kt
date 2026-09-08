package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FavoriteVesselsEntityUTests {
    private val mapper = jacksonObjectMapper()

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
    fun `toFavoriteVessels should deserialize the vessels JSON column`() {
        val entity =
            FavoriteVesselsEntity(
                hashedEmail = "hashed-email",
                vessels = mapper.writeValueAsString(listOf(phenomene, malotru)),
            )

        val favoriteVessels = entity.toFavoriteVessels(mapper)

        assertThat(favoriteVessels.hashedEmail).isEqualTo("hashed-email")
        assertThat(favoriteVessels.vessels).containsExactly(phenomene, malotru)
    }

    @Test
    fun `toFavoriteVessels should return an empty list When the column holds an empty JSON array`() {
        val entity = FavoriteVesselsEntity(hashedEmail = "hashed-email", vessels = "[]")

        assertThat(entity.toFavoriteVessels(mapper).vessels).isEmpty()
    }

    @Test
    fun `fromFavoriteVessels should serialize the vessels to a JSON string`() {
        val favoriteVessels =
            FavoriteVessels(hashedEmail = "hashed-email", vessels = listOf(phenomene))

        val entity = FavoriteVesselsEntity.fromFavoriteVessels(mapper, favoriteVessels)

        assertThat(entity.hashedEmail).isEqualTo("hashed-email")
        assertThat(entity.vessels).contains("\"name\":\"PHENOMENE\"")
    }

    @Test
    fun `fromFavoriteVessels then toFavoriteVessels should round-trip the domain object`() {
        val favoriteVessels =
            FavoriteVessels(hashedEmail = "hashed-email", vessels = listOf(phenomene, malotru))

        val roundTripped =
            FavoriteVesselsEntity
                .fromFavoriteVessels(mapper, favoriteVessels)
                .toFavoriteVessels(mapper)

        assertThat(roundTripped).isEqualTo(favoriteVessels)
    }
}
