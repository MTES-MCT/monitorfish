package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_objective.AddControlObjectiveYear
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.Clock
import java.time.LocalDate
import java.time.Month
import java.time.ZoneOffset

@ExtendWith(SpringExtension::class)
class AddControlObjectiveYearUTests {

    @MockBean
    private lateinit var controlObjectivesRepository: ControlObjectivesRepository

    @Test
    fun `execute Should add the next year When the current year is found in the control objective entries`() {
        // Given
        val currentYear = 2021
        val now = LocalDate.of(currentYear, Month.MAY, 3).atStartOfDay()
        val fixedClock = Clock.fixed(now.toInstant(ZoneOffset.UTC), ZoneOffset.UTC)
        given(controlObjectivesRepository.findYearEntries()).willReturn(listOf(currentYear, 2020))

        // When
        AddControlObjectiveYear(controlObjectivesRepository, fixedClock).execute()

        // Then
        Mockito.verify(controlObjectivesRepository).addYear(currentYear, 2022)
    }

    @Test
    fun `execute Should add the current year When the current year is not found in the control objective entries`() {
        // Given
        val currentYear = 2021
        val now = LocalDate.of(currentYear, Month.MAY, 3).atStartOfDay()
        val fixedClock = Clock.fixed(now.toInstant(ZoneOffset.UTC), ZoneOffset.UTC)
        given(controlObjectivesRepository.findYearEntries()).willReturn(listOf(2020, 2019, 2018))

        // When
        AddControlObjectiveYear(controlObjectivesRepository, fixedClock).execute()

        // Then
        Mockito.verify(controlObjectivesRepository).addYear(2020, currentYear)
    }

    @Test
    fun `execute Should throw an exception When the next year is already found in the control objective entries`() {
        // Given
        val currentYear = 2021
        val nextYear = 2022
        val now = LocalDate.of(currentYear, Month.MAY, 3).atStartOfDay()
        val fixedClock = Clock.fixed(now.toInstant(ZoneOffset.UTC), ZoneOffset.UTC)
        given(controlObjectivesRepository.findYearEntries()).willReturn(listOf(nextYear, currentYear, 2020))

        // When
        val throwable = catchThrowable {
            AddControlObjectiveYear(controlObjectivesRepository, fixedClock).execute()
        }

        // Then
        assertThat(throwable).isNotNull
        assertThat(throwable.message).isEqualTo("The year 2022 is already added in the control objectives")
    }
}
