package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.SearchVessels
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class SearchVesselsUTests {

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @MockBean
    private lateinit var beaconRepository: BeaconRepository

    @Test
    fun `execute Should return no vessel When there is no identification number`() {
        // Given
        given(vesselRepository.search(any())).willReturn(listOf(Vessel()))

        // When
        val vessels = SearchVessels(vesselRepository, beaconRepository).execute("DUMMY VESSEL")

        // Then
        assertThat(vessels).isEmpty()
    }

    @Test
    fun `execute Should return vessels When there is a match with a beacon`() {
        // Given
        given(vesselRepository.search(any())).willReturn(listOf(Vessel()))
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(
            listOf(Vessel(1, internalReferenceNumber = "1234"), Vessel(2, internalReferenceNumber = "5789"))
        )
        given(beaconRepository.search(any()))
            .willReturn(
                listOf(
                    Beacon("123", 1),
                    Beacon("12456", 2),
                    Beacon("123456789", null)
                )
            )

        // When
        val vessels = SearchVessels(vesselRepository, beaconRepository).execute("12")

        // Then
        assertThat(vessels).hasSize(2)
        assertThat(vessels.first().id).isEqualTo(1)
        assertThat(vessels.last().id).isEqualTo(2)
    }

    @Test
    fun `execute Should return vessels When there is a match with a beacon and the same vessel found in the vessel table`() {
        // Given
        given(vesselRepository.search(any())).willReturn(listOf(Vessel(id = 1, internalReferenceNumber = "1234")))
        given(beaconRepository.search(any()))
            .willReturn(
                listOf(
                    Beacon("123", 1),
                    Beacon("12456", 2),
                    Beacon("123456789", null)
                )
            )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(
            listOf(Vessel(1, internalReferenceNumber = "1234"), Vessel(2, internalReferenceNumber = "5789"))
        )

        // When
        val vessels = SearchVessels(vesselRepository, beaconRepository).execute("12")

        // Then
        assertThat(vessels).hasSize(2)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("1234")
        assertThat(vessels.last().internalReferenceNumber).isEqualTo("5789")
    }

    @Test
    fun `execute Should return vessels When there is a match with a beacon, the same vessel found in the vessel table and another vessel concatenated`() {
        // Given
        given(vesselRepository.search(any())).willReturn(
            listOf(Vessel(id = 123456, internalReferenceNumber = "12345688415"))
        )
        given(beaconRepository.search(any()))
            .willReturn(
                listOf(
                    Beacon("123", 1),
                    Beacon("12456", 2),
                    Beacon("123456789", null)
                )
            )
        given(vesselRepository.findVesselsByIds(eq(listOf(1, 2)))).willReturn(
            listOf(Vessel(1, internalReferenceNumber = "1234"), Vessel(2, internalReferenceNumber = "5789"))
        )

        // When
        val vessels = SearchVessels(vesselRepository, beaconRepository).execute("12")

        // Then
        assertThat(vessels).hasSize(3)
        assertThat(vessels.first().internalReferenceNumber).isEqualTo("12345688415")
        assertThat(vessels[1].internalReferenceNumber).isEqualTo("1234")
        assertThat(vessels.last().internalReferenceNumber).isEqualTo("5789")
    }
}
