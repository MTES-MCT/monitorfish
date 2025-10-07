package fr.gouv.cnsp.monitorfish.domain.use_cases.species

import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.species.GetSpeciesFromCode
import fr.gouv.cnsp.monitorfish.fakers.SpeciesFaker
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.bean.override.mockito.MockitoBean

@SpringBootTest(classes = [GetSpeciesFromCode::class])
class GetSpeciesFromCodeUTests {
    @Autowired
    private lateinit var getSpeciesFromCode: GetSpeciesFromCode

    @MockitoBean
    private lateinit var speciesRepository: SpeciesRepository

    @Test
    fun `execute should return null when code is null`() {
        val result = getSpeciesFromCode.execute(null)
        assertNull(result)
    }

    @Test
    fun `execute should return species when code is valid and species exists`() {
        // Given
        val code = "COD"
        val expectedSpecies = SpeciesFaker.fakeSpecies(code = code)
        `when`(speciesRepository.findByCode(code)).thenReturn(expectedSpecies)

        // When
        val result = getSpeciesFromCode.execute(code)

        // Then
        assertEquals(expectedSpecies, result)
        verify(speciesRepository, times(1)).findByCode(code)
    }

    @Test
    fun `execute should return null when repository throws exception`() {
        // Given
        val code = "INVALID"
        `when`(speciesRepository.findByCode(code)).thenThrow(RuntimeException("Database error"))

        // When
        val result = getSpeciesFromCode.execute(code)

        // Then
        assertNull(result)
        verify(speciesRepository, times(1)).findByCode(code)
    }

    @Test
    fun `execute should return null when repository throws any type of exception`() {
        // Given
        val code = "TEST"
        `when`(speciesRepository.findByCode(code)).thenThrow(IllegalArgumentException("Invalid code"))

        // When
        val result = getSpeciesFromCode.execute(code)

        // Then
        assertNull(result)
        verify(speciesRepository, times(1)).findByCode(code)
    }
}
