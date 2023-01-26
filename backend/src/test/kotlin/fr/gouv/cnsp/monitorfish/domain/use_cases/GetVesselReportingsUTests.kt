package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselReportings
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselReportingsUTests {

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var infractionRepository: InfractionRepository

    @Test
    fun `execute Should return the reporting of a specified vessel`() {
        // Given
        given(infractionRepository.findInfractionByNatinfCode(eq("7059"))).willReturn(
            Infraction(1, natinfCode = "7059", infractionCategory = InfractionCategory.FISHING)
        )
        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            listOf(
                Reporting(
                    id = 1,
                    type = ReportingType.ALERT,
                    vesselName = "BIDUBULE",
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "1236514",
                    ircs = "IRCS",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    creationDate = ZonedDateTime.now(),
                    validationDate = ZonedDateTime.now(),
                    value = ThreeMilesTrawlingAlert() as ReportingValue,
                    isArchived = false,
                    isDeleted = false
                ),
                Reporting(
                    id = 1,
                    type = ReportingType.ALERT,
                    vesselName = "BIDUBULE",
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "1236514",
                    ircs = "IRCS",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    creationDate = ZonedDateTime.now(),
                    validationDate = ZonedDateTime.now(),
                    value = ThreeMilesTrawlingAlert() as ReportingValue,
                    isArchived = false,
                    isDeleted = false
                ),
                Reporting(
                    id = 666,
                    type = ReportingType.ALERT,
                    vesselName = "BIDUBULE",
                    internalReferenceNumber = "FR224226850",
                    externalReferenceNumber = "1236514",
                    ircs = "IRCS",
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                    creationDate = ZonedDateTime.now().minusYears(1),
                    validationDate = ZonedDateTime.now().minusYears(1),
                    value = ThreeMilesTrawlingAlert() as ReportingValue,
                    isArchived = true,
                    isDeleted = false
                )
            )
        )

        // When
        val currentAndArchivedReportings = GetVesselReportings(reportingRepository, infractionRepository).execute(
            "FR224226850",
            "1236514",
            "IRCS",
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            ZonedDateTime.now().minusYears(1)
        )

        // Then
        assertThat(currentAndArchivedReportings.current).hasSize(2)
        assertThat(currentAndArchivedReportings.current.first().isArchived).isFalse
        assertThat(currentAndArchivedReportings.current.first().infraction?.natinfCode).isEqualTo("7059")
        assertThat(currentAndArchivedReportings.archived).hasSize(1)
        assertThat(currentAndArchivedReportings.archived.first().isArchived).isTrue
    }
}
