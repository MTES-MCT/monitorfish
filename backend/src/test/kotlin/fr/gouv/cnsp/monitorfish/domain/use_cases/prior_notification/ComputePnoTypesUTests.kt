package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoTypeRule
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoTypeRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ComputePnoTypesUTests {
    @MockBean
    private lateinit var pnoTypeRepository: PnoTypeRepository

    @Test
    fun `execute Should return empty list When catch and gears are empty`() {
        // Given
        val catchToLand = getCatches(listOf())
        val gearCodes = listOf<String>()
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(0)
    }

    @Test
    fun `execute Should return type 1 When single catch with type 1 is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.9.a", weight = 1500.0))
        val gearCodes = listOf("OTT")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis type 1"))
    }

    @Test
    fun `execute Should return types 1 and 2 When single catch with types 1 and 2 is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.9.a", weight = 2500.0))
        val gearCodes = listOf("TBB")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(2)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis type 1", "Préavis type 2"))
    }

    @Test
    fun `execute Should return specific types When single catch with flag state GB is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "HKE", faoZone = "37.1.3", weight = 2500.0))
        val gearCodes = listOf<String>()
        val flagState = CountryCode.GB
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(2)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis par pavillon", "Préavis type 1"))
    }

    @Test
    fun `execute Should return Préavis par pavillon When empty catch with flag state GB is given`() {
        // Given
        val gearCodes = listOf<String>()
        val flagState = CountryCode.GB
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(listOf(), gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis par pavillon"))
    }

    @Test
    fun `execute Should return single type When multiple catches are given`() {
        // Given
        val catchToLand =
            listOf(
                LogbookFishingCatch(species = "BSS", faoZone = "27.7.d", weight = 800.0),
                LogbookFishingCatch(species = "COD", faoZone = "27.8.c", weight = 800.0),
                LogbookFishingCatch(species = "COD", faoZone = "27.10.c", weight = 800.0),
            )
        val gearCodes = listOf("OTB")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis type 1"))
    }

    @Test
    fun `execute Should return types 1 and 2 When multiple catches with types 1 and 2 are given`() {
        // Given
        val catchToLand =
            listOf(
                LogbookFishingCatch(species = "MAC", faoZone = "27.7.d", weight = 5000.0),
                LogbookFishingCatch(species = "HOM", faoZone = "27.8.a", weight = 5000.0),
                LogbookFishingCatch(species = "HER", faoZone = "34.1.2", weight = 5000.0),
            )
        val gearCodes = listOf("PTM")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(2)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis type 1", "Préavis type 2"))
    }

    @Test
    fun `execute Should return empty list When single catch with no expected types is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.2.a", weight = 3500.0))
        val gearCodes = listOf("OTM")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(0)
    }

    @Test
    fun `execute Should return specific type When non-empty catch with specific gear is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "HKE", faoZone = "27.2.a", weight = 3500.0))
        val gearCodes = listOf("SB")
        val flagState = CountryCode.FR
        val expectedPnoTypeNames = listOf("Préavis par engin")
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(expectedPnoTypeNames.size)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(expectedPnoTypeNames)
    }

    @Test
    fun `execute Should return Préavis par engin When empty catch with specific gear is given`() {
        // Given
        val catchToLand = listOf<LogbookFishingCatch>()
        val gearCodes = listOf("SB")
        val flagState = CountryCode.FR
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis par engin"))
    }

    @Test
    fun `execute Should return Préavis par engin et pavillon When empty catch with specific gear is given`() {
        // Given
        val catchToLand = listOf<LogbookFishingCatch>()
        val gearCodes = listOf("OTB")
        val flagState = CountryCode.AD
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis par engin et pavillon"))
    }

    @Test
    fun `execute Should return Préavis par espèce, fao et pavillon When empty catch with specific gear is given`() {
        // Given
        val catchToLand = listOf(LogbookFishingCatch(species = "AMZ", faoZone = "37.2.a", weight = 3500.0))
        val gearCodes = listOf<String>()
        val flagState = CountryCode.AD
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis par espèce, fao et pavillon"))
    }

    @Test
    fun `execute Should return no pno type associated`() {
        // Given
        val catchToLand = listOf<LogbookFishingCatch>()
        val gearCodes = listOf("OTM")
        val flagState = CountryCode.AD
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(0)
    }

    @Test
    fun `execute Should not return Préavis type 7 When there is only one match in each rule`() {
        // Given
        val catchToLand = listOf<LogbookFishingCatch>()
        val gearCodes = listOf("OTT")
        val flagState = CountryCode.BB
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(0)
    }

    @Test
    fun `execute Should throw an Exception When the faoZone is missing a catch`() {
        // Given
        given(pnoTypeRepository.findAll()).willReturn(TestUtils.getDummyPnoTypes())

        // When
        val throwable =
            catchThrowable {
                ComputePnoTypes(pnoTypeRepository).execute(
                    listOf(LogbookFishingCatch(species = "HKE", weight = 3500.0)),
                    listOf(),
                    CountryCode.FR,
                )
            }

        // Then
        assertThat(throwable).hasMessage("All `faoZone` of catches must be given.")
    }

    @Test
    fun `execute Should return the type When there is no rule in the type rules`() {
        // Given
        val catchToLand = listOf<LogbookFishingCatch>()
        val gearCodes = listOf("OTM")
        val flagState = CountryCode.AD
        val pnoType =
            PnoType(
                id = 8,
                name = "Préavis sans règle",
                minimumNotificationPeriod = 4.0,
                hasDesignatedPorts = true,
                pnoTypeRules =
                    listOf(
                        PnoTypeRule(
                            id = 10,
                            species = listOf(),
                            faoAreas = listOf(),
                            cgpmAreas = listOf(),
                            gears = listOf(),
                            flagStates = listOf(),
                            minimumQuantityKg = 0.0,
                        ),
                    ),
            )
        given(pnoTypeRepository.findAll()).willReturn(listOf(pnoType))

        // When
        val result = ComputePnoTypes(pnoTypeRepository).execute(catchToLand, gearCodes, flagState)

        // Then
        assertThat(result).hasSize(1)
        val resultPnoTypeNames = result.map { it.name }
        assertThat(resultPnoTypeNames).containsAll(listOf("Préavis sans règle"))
    }

    private fun getCatches(speciesAndFaoArea: List<List<String>>) =
        speciesAndFaoArea.map {
            val aCatch = LogbookFishingCatch(weight = 123.0)
            aCatch.species = it[0]
            aCatch.faoZone = it[1]
            aCatch.weight = it[2].toDouble()

            return@map aCatch
        }
}
