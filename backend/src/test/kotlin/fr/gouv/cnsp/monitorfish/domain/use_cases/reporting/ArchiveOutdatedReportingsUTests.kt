package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.MissingFARAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.TwelveMilesFishingAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ArchiveOutdatedReportingsUTests {
    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @Test
    fun `execute Should archive outdated reportings`() {
        // Given
        given(reportingRepository.findUnarchivedReportings()).willReturn(
            listOf(
                Pair(1, TwelveMilesFishingAlert("NAMO")),
                Pair(2, ThreeMilesTrawlingAlert("NAMO")),
                Pair(3, MissingFARAlert("NAMO")),
            ),
        )

        // When
        ArchiveOutdatedReportings(reportingRepository).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(listOf(2, 3)))
    }
}
