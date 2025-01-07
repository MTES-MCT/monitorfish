package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.TestUtils.getDummyFleetSegments
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos.SpeciesCatchForSegmentCalculation
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.Clock
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class ComputeFleetSegmentsUTests {
    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    companion object {
        val fixedClock: Clock = Clock.systemUTC()

        val testObjects = listOf(
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 200.0, gear = "LLS", species = "BSS", faoArea = "27.7.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 200.0, gear = "LLS", species = "BSS", faoArea = "27.8.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 100.0, gear = "LLS", species = "HKE", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 100.0, gear = "LLS", species = "HKE", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 250.0, gear = "LLS", species = "NEP", faoArea = "27.7.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 250.0, gear = "LLS", species = "NEP", faoArea = "27.8.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 100.0, gear = "LLS", species = "SOL", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 100.0, gear = "LLS", species = "SOL", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 80.0, gear = "LLS", species = "SWO", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.TUNA),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 80.0, gear = "LLS", species = "SWO", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.TUNA),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 200.0, gear = "OTB", species = "BSS", faoArea = "27.7.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 200.0, gear = "OTB", species = "BSS", faoArea = "27.8.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 100.0, gear = "OTB", species = "HKE", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 100.0, gear = "OTB", species = "HKE", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 250.0, gear = "OTB", species = "NEP", faoArea = "27.7.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 250.0, gear = "OTB", species = "NEP", faoArea = "27.8.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 100.0, gear = "OTB", species = "SOL", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 100.0, gear = "OTB", species = "SOL", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 80.0, gear = "OTB", species = "SWO", faoArea = "27.7.a", scipSpeciesType = ScipSpeciesType.TUNA),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 80.0, gear = "OTB", species = "SWO", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.TUNA),
            SpeciesCatchForSegmentCalculation(mesh = 90.0, weight = 200000.0, gear = "OTB", species = "ABC", faoArea = "27.7.d", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 90.0, weight = 22000.0, gear = "OTB", species = "DEF", faoArea = "27.7.e", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = 90.0, weight = 15000.0, gear = "OTB", species = "GHI", faoArea = "28.8.a", scipSpeciesType = null),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 50.0, gear = "LLS", species = "COD", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 120.0, gear = "LLS", species = "HKE", faoArea = "27.8.a", scipSpeciesType = ScipSpeciesType.DEMERSAL),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 5000.0, gear = "OTM", species = "PIL", faoArea = "27.8", scipSpeciesType = ScipSpeciesType.PELAGIC),
            SpeciesCatchForSegmentCalculation(mesh = 80.0, weight = 5000.0, gear = "OTM", species = "PIL", faoArea = "27.9", scipSpeciesType = ScipSpeciesType.PELAGIC),
            SpeciesCatchForSegmentCalculation(mesh = null, weight = 2500.0, gear = null, species = "PIL", faoArea = "27.8", scipSpeciesType = ScipSpeciesType.PELAGIC)
        )
    }

    @Test
    fun `execute Should return no segment if the gears are missing`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.1", "27.8.c"), listOf(), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).isEmpty()
    }

    @Test
    fun `execute Should return no segment is the species are missing`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.1", "27.8.c"), listOf("OTB", "OTT"), listOf())

        // Then
        assertThat(segment).isEmpty()
    }

    @Test
    fun `execute Should return the SWW01 02 03 segment`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.1", "27.8.c"), listOf("OTB", "OTT"), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("SWW01/02/03")
    }

    @Test
    fun `execute Should return the NWW01 02 segment When a bycatch specy is found in the species list`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.5.b"), listOf("TB"), listOf("ANF"))

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("NWW01/02")
    }

    @Test
    fun `execute Should return two segments is SWW`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.1", "27.8.c"), listOf("OTB", "OTT", "OTM"), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).hasSize(2)
        assertThat(segment.first().segment).isEqualTo("SWW01/02/03")
        assertThat(segment.last().segment).isEqualTo("SWW04")
    }

    @Test
    fun `execute Should return the SWW06 WITH NO GEAR segment When there is no gear associated to this segment`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.9"), listOf(), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("SWW06 WITH NO GEAR")
    }

    @Test
    fun `execute Should return the SWW06 WITH NO SPECIES segment When there is no species associated to this segment`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf("27.9"), listOf("SDN"), listOf())

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("SWW06 WITH NO SPECIES")
    }

    @Test
    fun `execute Should return the SWW06 WITH NO FAO AREAS segment When there is no species associated to this segment`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment =
            ComputeFleetSegments(
                fleetSegmentRepository,
                fixedClock,
            )
                .execute(listOf(), listOf("SDN"), listOf("HKE"))

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("SWW06 WITH NO FAO AREAS")
    }
}
