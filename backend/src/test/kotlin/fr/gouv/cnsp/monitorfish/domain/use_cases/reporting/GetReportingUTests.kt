package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetReportingUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @Test
    fun `execute Should call findById and return the reporting`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                id = 42,
                cfr = "FRFGRGR",
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(42)).willReturn(reporting)

        // When
        val result = GetReporting(reportingRepository).execute(42)

        // Then
        assertThat(result).isEqualTo(reporting)
    }
}
