package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos.SpeciesCatchForSegmentCalculation
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class UtilsUTests {
    @Test
    fun `removeRedundantFaoArea Should remove redundant fao codes`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1"),
                FaoArea(faoCode = "27.1"),
                FaoArea(faoCode = "18"),
                FaoArea(faoCode = "27.1.B.a"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(2)
        assertThat(filteredFaoAreas.first().faoCode).isEqualTo("18")
        assertThat(filteredFaoAreas.last().faoCode).isEqualTo("27.1.B.a")
    }

    @Test
    fun `removeRedundantFaoArea Should keep different fao codes`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.B"),
                FaoArea(faoCode = "27.1.C"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(2)
        assertThat(filteredFaoAreas.first().faoCode).isEqualTo("27.1.B")
        assertThat(filteredFaoAreas.last().faoCode).isEqualTo("27.1.C")
    }

    @Test
    fun `removeRedundantFaoArea Should not remove redundant fao codes When fao code is not located at the start of the string`() {
        // Given
        val faoAreas =
            listOf(
                FaoArea(faoCode = "27"),
                FaoArea(faoCode = "22.1.27"),
                FaoArea(faoCode = "18"),
            )

        // When
        val filteredFaoAreas = removeRedundantFaoArea(faoAreas)

        // Then
        assertThat(filteredFaoAreas).hasSize(3)
    }

    @Test
    fun `hasFaoCodeIncludedIn Should test fao areas included in another fao area`() {
        val faoAreaOne = FaoArea(faoCode = "27.1.B")
        assertThat(faoAreaOne.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaTwo = FaoArea(faoCode = "27.1")
        assertThat(faoAreaTwo.hasFaoCodeIncludedIn("27.1")).isTrue()

        val faoAreaThree = FaoArea(faoCode = "28.1")
        assertThat(faoAreaThree.hasFaoCodeIncludedIn("27.1")).isFalse()

        val faoAreaFour = FaoArea(faoCode = "28.1.56")
        assertThat(faoAreaFour.hasFaoCodeIncludedIn("56")).isFalse()
    }

    @Test
    fun `getSpeciesCatchesForSegmentCalculation Should return species catches cartesian product for controls`() {
        // Given
        val faoZones = listOf("27.7.a", "27.8.a")
        val gears =
            listOf(
                GearControl().also {
                    it.gearCode = "LLS"
                },
                GearControl().also {
                    it.gearCode = "OTB"
                    it.declaredMesh = 80.0
                },
                GearControl().also {
                    it.gearCode = "OTM"
                    it.controlledMesh = 80.0
                },
            )
        val species =
            listOf(
                SpeciesControl().also {
                    it.speciesCode = "BSS"
                    it.declaredWeight = 200.0
                },
                SpeciesControl().also {
                    it.speciesCode = "HKE"
                    it.declaredWeight = 100.0
                },
                SpeciesControl().also {
                    it.speciesCode = "NEP"
                    it.declaredWeight = 250.0
                },
                SpeciesControl().also {
                    it.speciesCode = "SOL"
                    it.declaredWeight = 100.0
                },
                SpeciesControl().also {
                    it.speciesCode = "SWO"
                    it.declaredWeight = 80.0
                },
            )
        val allSpecies =
            listOf(
                Species("BSS", "", null),
                Species("HKE", "", ScipSpeciesType.DEMERSAL),
                Species("NEP", "", null),
                Species("SOL", "", ScipSpeciesType.DEMERSAL),
                Species("SWO", "", ScipSpeciesType.TUNA),
            )
        val expectedResults =
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
                    weight = 100.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.7.a",
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
                    weight = 100.0,
                    gear = "LLS",
                    species = "SOL",
                    faoArea = "27.7.a",
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
                    mesh = 80.0,
                    weight = 200.0,
                    gear = "OTB",
                    species = "BSS",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTB",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 250.0,
                    gear = "OTB",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTB",
                    species = "SOL",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 80.0,
                    gear = "OTB",
                    species = "SWO",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 200.0,
                    gear = "OTM",
                    species = "BSS",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTM",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 250.0,
                    gear = "OTM",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTM",
                    species = "SOL",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 80.0,
                    gear = "OTM",
                    species = "SWO",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
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
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
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
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "LLS",
                    species = "SWO",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 200.0,
                    gear = "OTB",
                    species = "BSS",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTB",
                    species = "HKE",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 250.0,
                    gear = "OTB",
                    species = "NEP",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTB",
                    species = "SOL",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 80.0,
                    gear = "OTB",
                    species = "SWO",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 200.0,
                    gear = "OTM",
                    species = "BSS",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTM",
                    species = "HKE",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 250.0,
                    gear = "OTM",
                    species = "NEP",
                    faoArea = "27.8.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 100.0,
                    gear = "OTM",
                    species = "SOL",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = 80.0,
                    weight = 80.0,
                    gear = "OTM",
                    species = "SWO",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
            )

        // When
        val speciesCatches =
            getSpeciesCatchesForSegmentCalculation(
                faoZones,
                gears,
                species,
                allSpecies,
            )

        // Then
        assertThat(speciesCatches).hasSize(30)
        assertThat(speciesCatches)
            .usingRecursiveFieldByFieldElementComparator()
            .containsExactlyElementsOf(expectedResults)
    }

    @Test
    fun `getSpeciesCatchesForSegmentCalculation Should return species catches cartesian product for logbook catches`() {
        // Given
        val gears = listOf("LLS", "OTB", "OTM")
        val species =
            listOf(
                LogbookFishingCatch().also {
                    it.species = "BSS"
                    it.faoZone = "27.7.a"
                    it.weight = 200.0
                },
                LogbookFishingCatch().also {
                    it.species = "HKE"
                    it.faoZone = "27.7.a"
                    it.weight = 100.0
                },
                LogbookFishingCatch().also {
                    it.species = "NEP"
                    it.faoZone = "27.7.a"
                    it.weight = 80.0
                },
                LogbookFishingCatch().also {
                    it.species = "SOL"
                    it.faoZone = "27.8.a"
                    it.weight = 100.0
                },
                LogbookFishingCatch().also {
                    it.species = "SWO"
                    it.faoZone = "27.8"
                    it.weight = 80.0
                },
            )
        val allSpecies =
            listOf(
                Species("BSS", "", null),
                Species("HKE", "", ScipSpeciesType.DEMERSAL),
                Species("NEP", "", null),
                Species("SOL", "", ScipSpeciesType.DEMERSAL),
                Species("SWO", "", ScipSpeciesType.TUNA),
            )
        val expectedResults =
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
                    weight = 100.0,
                    gear = "LLS",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "LLS",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
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
                    faoArea = "27.8",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 200.0,
                    gear = "OTB",
                    species = "BSS",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "OTB",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "OTB",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "OTB",
                    species = "SOL",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "OTB",
                    species = "SWO",
                    faoArea = "27.8",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 200.0,
                    gear = "OTM",
                    species = "BSS",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "OTM",
                    species = "HKE",
                    faoArea = "27.7.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "OTM",
                    species = "NEP",
                    faoArea = "27.7.a",
                    scipSpeciesType = null,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 100.0,
                    gear = "OTM",
                    species = "SOL",
                    faoArea = "27.8.a",
                    scipSpeciesType = ScipSpeciesType.DEMERSAL,
                ),
                SpeciesCatchForSegmentCalculation(
                    mesh = null,
                    weight = 80.0,
                    gear = "OTM",
                    species = "SWO",
                    faoArea = "27.8",
                    scipSpeciesType = ScipSpeciesType.TUNA,
                ),
            )

        // When
        val speciesCatches =
            getSpeciesCatchesForSegmentCalculation(
                gears,
                species,
                allSpecies,
            )

        // Then
        assertThat(speciesCatches).hasSize(15)
        assertThat(speciesCatches)
            .usingRecursiveFieldByFieldElementComparator()
            .containsExactlyElementsOf(expectedResults)
    }
}
