package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetVesselReporting
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselReportingUTests {

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @Test
    fun `execute Should return the reporting of a specified vessel`() {
        // Given
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
                                isDeleted = false),
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
                                isDeleted = false),
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
                                isDeleted = false)))

        // When
        val currentAndArchivedReporting = GetVesselReporting(reportingRepository).execute(
                "FR224226850",
                "1236514",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1))

        // Then
        assertThat(currentAndArchivedReporting.current).hasSize(2)
        assertThat(currentAndArchivedReporting.current.first().isArchived).isFalse
        assertThat(currentAndArchivedReporting.archived).hasSize(1)
        assertThat(currentAndArchivedReporting.archived.first().isArchived).isTrue
    }
}
