package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.TestUtils.fleetSegmentsForComputation
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos.SpeciesCatchForSegmentCalculation
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ComputeFleetSegmentsUTests {
    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute Should compute Lines segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 200.0,
                    gear = "LLS",
                    species = "BSS",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 200.0,
                    gear = "LLS",
                    species = "BSS",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 250.0,
                    gear = "LLS",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 250.0,
                    gear = "LLS",
                    species = "NEP",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "LLS",
                    species = "SOL",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "LLS",
                    species = "SOL",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "LLS",
                    species = "SWO",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "LLS",
                    species = "SWO",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Chalutier pêche arrière congélateur",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("L")
    }

    @Test
    fun `execute Should compute T8-PEL segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 5000.0,
                    gear = "OTM",
                    species = "PIL",
                    faoArea = "27.8",
                    scipSpeciesType = ScipSpeciesType.PELAGIC,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 5000.0,
                    gear = "OTM",
                    species = "PIL",
                    faoArea = "27.9",
                    scipSpeciesType = ScipSpeciesType.PELAGIC,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Chalutier pêche arrière congélateur",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("T8-PEL")
    }

    @Test
    fun `execute Should compute FT segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 200000.0,
                    gear = "OTB",
                    species = "ABC",
                    faoArea = "27.7.d",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 22000.0,
                    gear = "OTB",
                    species = "DEF",
                    faoArea = "27.7.e",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 15000.0,
                    gear = "OTB",
                    species = "GHI",
                    faoArea = "28.8.a",
                    scipSpeciesType = null,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Chalutier pêche arrière congélateur",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("FT")
    }

    @Test
    fun `execute Should compute T8-9 segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 200000.0,
                    gear = "OTB",
                    species = "ABC",
                    faoArea = "27.7.d",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 22000.0,
                    gear = "OTB",
                    species = "DEF",
                    faoArea = "27.7.e",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 90.0,
                    weight = 15000.0,
                    gear = "OTB",
                    species = "GHI",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Navire polyvalent",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("T8-9")
    }

    @Test
    fun `execute Should compute L HKE segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 50.0,
                    gear = "LLS",
                    species = "COD",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 120.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Navire polyvalent",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("L HKE")
    }

    @Test
    fun `execute Should compute PS BFT Prioritized segment`() {
        // Given
        val speciesCatches =
            listOf(
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 50.0,
                    gear = "PS",
                    species = "BFT",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 120.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
            )
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Navire polyvalent",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, speciesCatches)

        // Then
        assertThat(fleetSegments).hasSize(1)
        assertThat(fleetSegments[0].segment).isEqualTo("L HKE")
    }

    @Test
    fun `execute Should compute no segment`() {
        // Given
        given(fleetSegmentRepository.findAllByYear(eq(2025))).willReturn(fleetSegmentsForComputation)
        given(vesselRepository.findVesselById(any())).willReturn(
            Vessel(
                id = 1,
                internalReferenceNumber = "FR00022680",
                vesselName = "MY AWESOME VESSEL",
                flagState = CountryCode.FR,
                declaredFishingGears = listOf("Trémails"),
                vesselType = "Navire polyvalent",
                districtCode = "AY",
                hasLogbookEsacapt = false,
            ),
        )

        // When
        val fleetSegments =
            ComputeFleetSegments(
                fleetSegmentRepository,
                vesselRepository,
            ).execute(2025, 1, listOf())

        // Then
        assertThat(fleetSegments).hasSize(0)
    }
}
