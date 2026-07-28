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
        // The reporting ids are intentionally different from the alert specification ids: the archiving
        // decision must be taken on the alert id carried by the reporting value, not on the reporting id.
        given(reportingRepository.findUnarchivedReportingsAfterNewVoyage()).willReturn(
            listOf(
                Pair(
                    100,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = DUMMY_POSITION_ALERT.id,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
                ),
                Pair(
                    101,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 999,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Pêche en zone RTC",
                    ),
                ),
                Pair(102, AlertType.MISSING_FAR_48_HOURS_ALERT.getValue()),
            ),
        )
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT))
        given(reportingRepository.findExpiredReportings()).willReturn(listOf(4, 5))
        given(reportingRepository.findUnarchivedNonAlertReportingsWithDepValidityAfterNewVoyage())
            .willReturn(emptyList())

        // When
        ArchiveOutdatedReportings(reportingRepository, positionAlertSpecification).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(listOf(100, 102, 4, 5)))
    }

    @Test
    fun `execute Should not archive a position alert reporting when its specification has no automatic archiving`() {
        // Given
        given(reportingRepository.findUnarchivedReportingsAfterNewVoyage()).willReturn(
            listOf(
                Pair(
                    100,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = DUMMY_POSITION_ALERT.id,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
                ),
            ),
        )
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT.copy(hasAutomaticArchiving = false)))
        given(reportingRepository.findExpiredReportings()).willReturn(emptyList())
        given(reportingRepository.findUnarchivedNonAlertReportingsWithDepValidityAfterNewVoyage())
            .willReturn(emptyList())

        // When
        ArchiveOutdatedReportings(reportingRepository, positionAlertSpecification).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(emptyList()))
    }

    @Test
    fun `execute Should archive OBSERVATION and INFRACTION_SUSPICION reportings with UNTIL_NEXT_DEP after a new voyage`() {
        // Given
        given(reportingRepository.findUnarchivedReportingsAfterNewVoyage()).willReturn(emptyList())
        given(positionAlertSpecification.findAllByIsDeletedIsFalse()).willReturn(emptyList())
        given(reportingRepository.findExpiredReportings()).willReturn(emptyList())
        given(reportingRepository.findUnarchivedNonAlertReportingsWithDepValidityAfterNewVoyage())
            .willReturn(listOf(10, 11))

        // When
        ArchiveOutdatedReportings(reportingRepository, positionAlertSpecification).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(listOf(10, 11)))
    }

    @Test
    fun `execute Should combine alert voyages, expired, and UNTIL_NEXT_DEP non-alert reportings`() {
        // Given
        given(reportingRepository.findUnarchivedReportingsAfterNewVoyage()).willReturn(
            listOf(
                Pair(
                    100,
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = DUMMY_POSITION_ALERT.id,
                        natinfCode = 7059,
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                        name = "Chalutage dans les 3 milles",
                    ),
                ),
            ),
        )
        given(positionAlertSpecification.findAllByIsDeletedIsFalse())
            .willReturn(listOf(DUMMY_POSITION_ALERT))
        given(reportingRepository.findExpiredReportings()).willReturn(listOf(2))
        given(reportingRepository.findUnarchivedNonAlertReportingsWithDepValidityAfterNewVoyage())
            .willReturn(listOf(3, 4))

        // When
        ArchiveOutdatedReportings(reportingRepository, positionAlertSpecification).execute()

        // Then
        verify(reportingRepository).archiveReportings(eq(listOf(100, 2, 3, 4)))
    }
}
