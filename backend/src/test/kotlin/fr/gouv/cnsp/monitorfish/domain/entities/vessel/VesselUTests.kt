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
                externalReferenceNumber = "AY22680",
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

    @Test
    fun `isIdentifiable Should return false when all identifiers are null`() {
        // Given
        val vessel =
            VesselFaker.fakeVessel(
                internalReferenceNumber = null,
                externalReferenceNumber = null,
                ircs = null,
                mmsi = null,
            )

        // When
        val result = vessel.isIdentifiable()

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `isIdentifiable Should return true when some identifiers are not null`() {
        // Given
        val vessel =
            VesselFaker.fakeVessel(
                internalReferenceNumber = "1234",
                externalReferenceNumber = null,
                ircs = null,
                mmsi = null,
            )

        // When
        val result = vessel.isIdentifiable()

        // Then
        assertThat(result).isTrue()
    }
}
