package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class ArchiveOutdatedReportingsUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var positionAlertSpecification: PositionAlertSpecificationRepository

    @Test
    fun `execute Should archive outdated reportings`() {
        // Given
        given(reportingRepository.findUnarchivedReportingsAfterNewVoyage()).willReturn(
            listOf(
                Pair(
                    1,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ),
                ),
                Pair(
                    2,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 2,
                        natinfCode = 7059,
                        name = "Pêche en zone RTC",
                    ),
                ),
                Pair(3, AlertType.MISSING_FAR_48_HOURS_ALERT.getValue()),
            ),
        )
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT))
        given(reportingRepository.findExpiredReportings()).willReturn(
            listOf(4, 5),
        )

        // When
        ArchiveOutdatedReportings(reportingRepository, positionAlertSpecification).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(listOf(1, 3, 4, 5)))
    }
}
