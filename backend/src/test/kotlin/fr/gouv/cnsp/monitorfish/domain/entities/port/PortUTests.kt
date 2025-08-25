package fr.gouv.cnsp.monitorfish.domain.entities.port

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselEmitsPositions
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class PortUTests {
    @Test
    fun `isFrenchOrUnknown Should return true when its country code is unknown`() {
        // Given
        val port = PortFaker.fakePort(countryCode = null)

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrenchOrUnknown Should return true when its country code is French`() {
        // Given
        val port = PortFaker.fakePort(countryCode = "TF")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isFrenchOrUnknown Should return false when its country code is not French`() {
        // Given
        val port = PortFaker.fakePort(countryCode = "US")

        // When
        val result = port.isFrenchOrUnknown()

        // Then
        assertThat(result).isFalse()
    }

    @Test
    fun `isInGroup should return true when the given landingPortLocdes match the port locode`() {
        // Given
        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.YES),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = listOf("FRABC"),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )
        val port = PortFaker.fakePort(locode = "FRABC")

        // When
        val result = port.isInGroup(group)

        // Then
        assertThat(result).isTrue()
    }

    @Test
    fun `isInGroup should return false when the given landingPortLocdes doesnt match the port locode`() {
        // Given
        val group =
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Dummy group",
                description = "",
                pointsOfAttention = "",
                color = "",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        emitsPositions = listOf(VesselEmitsPositions.YES),
                        gearCodes = emptyList(),
                        hasLogbook = null,
                        lastControlPeriod = null,
                        landingPortLocodes = listOf("FRABC"),
                        lastPositionHoursAgo = null,
                        producerOrganizations = listOf("OP_NORD"),
                        riskFactors = emptyList(),
                        specyCodes = emptyList(),
                        vesselSize = null,
                        vesselsLocation = emptyList(),
                        zones = emptyList(),
                    ),
            )
        val port = PortFaker.fakePort(locode = "FRAAA")

        // When
        val result = port.isInGroup(group)

        // Then
        assertThat(result).isFalse()
    }
}
