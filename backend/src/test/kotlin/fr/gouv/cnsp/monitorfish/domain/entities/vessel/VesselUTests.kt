package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.fakers.VesselFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VesselUTests {
    @Test
    fun `getNationalIdentifier should return the identifier for a FR vessel`() {
        // Given
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "FRA00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            )

        // When
        val nationalIdentifier = vessel.getNationalIdentifier()

        // Then
        assertThat(nationalIdentifier).isEqualTo("AY22680")
    }

    @Test
    fun `getNationalIdentifier should return the identifier for a FR vessel When district code is null`() {
        // Given
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "FRA00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "",
                hasLogbookEsacapt = false,
            )

        // When
        val nationalIdentifier = vessel.getNationalIdentifier()

        // Then
        assertThat(nationalIdentifier).isEqualTo("22680")
    }

    @Test
    fun `getNationalIdentifier should return the identifier for a GB vessel`() {
        // Given
        val vessel =
            Vessel(
                id = 1,
                internalReferenceNumber = "GBR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.GB,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Fishing",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            )

        // When
        val nationalIdentifier = vessel.getNationalIdentifier()

        // Then
        assertThat(nationalIdentifier).isEqualTo("AY22680")
    }

    @Test
    fun `isFrench Should return true when its flag state is French`() {
        // Given
        val vessel = VesselFaker.fakeVessel(flagState = CountryCode.MQ)

        // When
        val result = vessel.isFrench()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrench Should return false when its flag state is not French`() {
        // Given
        val vessel = VesselFaker.fakeVessel(flagState = CountryCode.ES)

        // When
        val result = vessel.isFrench()

        // Then
        assertThat(result).isFalse()
    }
}
