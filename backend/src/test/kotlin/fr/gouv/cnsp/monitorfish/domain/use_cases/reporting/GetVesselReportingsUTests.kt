package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.createCurrentReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselReportingsUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    @Test
    fun `execute Should return a map of years for archived`() {
        // Given
        val expectedDateTime = ZonedDateTime.now().minusYears(10)
        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            emptyList(),
        )

        // When
        val currentAndArchivedReportings =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                null,
                "FR224226850",
                "1236514",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                expectedDateTime,
            )

        // Then
        val range = expectedDateTime.year..ZonedDateTime.now().year
        assertThat(currentAndArchivedReportings.archived).hasSize(11)
        assertThat(currentAndArchivedReportings.archived.keys.toList()).isEqualTo(range.toList())
    }

    @Test
    fun `execute Should return the reporting of a specified vessel When vessel id is null`() {
        // Given
        val expectedDateTime = ZonedDateTime.now()
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            Infraction(
                natinfCode = 7059,
                infractionCategory = InfractionCategory.FISHING,
            ),
        )
        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            TestUtils.getDummyReportings(expectedDateTime),
        )

        // When
        val currentAndArchivedReportings =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                null,
                "FR224226850",
                "1236514",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(currentAndArchivedReportings.current).hasSize(1)
        val firstCurrentReporting = currentAndArchivedReportings.current.first()
        assertThat(firstCurrentReporting.otherOccurrencesOfSameAlert).hasSize(1)
        assertThat(firstCurrentReporting.reporting.isArchived).isFalse
        assertThat(firstCurrentReporting.reporting.infraction?.natinfCode).isEqualTo(7059)

        assertThat(currentAndArchivedReportings.archived).hasSize(2)
        val archivedReporting = currentAndArchivedReportings.archived
        val currentYearReportings = archivedReporting[expectedDateTime.year.dec()]
        assertThat(currentYearReportings).hasSize(1)
        assertThat(currentYearReportings?.first()?.reporting?.isArchived).isTrue
        val lastYearReportings = archivedReporting[expectedDateTime.year]
        assertThat(lastYearReportings).hasSize(0)
    }

    @Test
    fun `execute Should return the reporting of a specified vessel When vessel id is not null`() {
        // Given
        val expectedDateTime = ZonedDateTime.now()
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            Infraction(
                natinfCode = 7059,
                infractionCategory = InfractionCategory.FISHING,
            ),
        )
        given(reportingRepository.findCurrentAndArchivedByVesselIdEquals(eq(123456), any())).willReturn(
            TestUtils.getDummyReportings(expectedDateTime),
        )

        // When
        val currentAndArchivedReportings =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                123456,
                "FR224226850",
                "1236514",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(currentAndArchivedReportings.current).hasSize(1)
        assertThat(currentAndArchivedReportings.archived).hasSize(2)
    }

    @Test
    fun `execute Should build the last reporting and other occurrences object`() {
        // Given
        val firstReporting =
            createCurrentReporting(
                id = 12345,
                validationDate = ZonedDateTime.parse("2022-09-15T10:15:30Z"),
                internalReferenceNumber = "FR224226850",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
            )

        val secondReporting =
            createCurrentReporting(
                id = 123456,
                validationDate = ZonedDateTime.parse("2022-11-20T08:00:00Z"),
                internalReferenceNumber = "FR224226850",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
            )

        val thirdReporting =
            createCurrentReporting(
                id = 1234567,
                validationDate = ZonedDateTime.parse("2024-12-30T15:08:05.845121Z"),
                internalReferenceNumber = "FR224226850",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
            )

        val fourthReporting =
            createCurrentReporting(
                id = 12345678,
                validationDate = ZonedDateTime.parse("2023-10-30T09:10:00Z"),
                internalReferenceNumber = "FR224226850",
                type = ReportingType.ALERT,
                alertType = AlertType.MISSING_FAR_ALERT,
            )

        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            listOf(firstReporting, secondReporting, thirdReporting, fourthReporting),
        )

        // When
        val result =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                null,
                "FR224226850",
                "1236514",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(result.current).hasSize(2)

        val firstResult = result.current[0]
        assertThat(firstResult.reporting.id).isEqualTo(1234567)
        assertThat((firstResult.reporting.value as Alert).type).isEqualTo(
            AlertType.POSITION_ALERT,
        )

        assertThat(firstResult.otherOccurrencesOfSameAlert).hasSize(2)
        assertThat(firstResult.otherOccurrencesOfSameAlert[0].id).isEqualTo(123456)
        assertThat((firstResult.otherOccurrencesOfSameAlert[0].value as Alert).type).isEqualTo(
            AlertType.POSITION_ALERT,
        )
        assertThat(firstResult.otherOccurrencesOfSameAlert[1].id).isEqualTo(12345)
        assertThat((firstResult.otherOccurrencesOfSameAlert[1].value as Alert).type).isEqualTo(
            AlertType.POSITION_ALERT,
        )

        val secondResult = result.current[1]
        assertThat(secondResult.reporting.id).isEqualTo(12345678)
        assertThat((secondResult.reporting.value as Alert).type).isEqualTo(AlertType.MISSING_FAR_ALERT)
        assertThat(secondResult.otherOccurrencesOfSameAlert).isEmpty()
    }

    @Test
    fun `execute Should correctly process mixed ReportingTypes with ALERT and INFRACTION_SUSPICION`() {
        // Given
        val alertReporting1 =
            createCurrentReporting(
                id = 11223,
                validationDate = ZonedDateTime.parse("2024-01-01T12:00:00Z"),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
            )

        val alertReporting2 =
            createCurrentReporting(
                id = 22334,
                validationDate = ZonedDateTime.parse("2024-02-01T12:00:00Z"),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
            )

        val infractionReporting =
            createCurrentReporting(
                id = 33445,
                validationDate = ZonedDateTime.parse("2024-03-01T12:00:00Z"),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.INFRACTION_SUSPICION,
                alertType = null, // Not applicable for INFRACTION_SUSPICION
            )

        val alertReporting3 =
            createCurrentReporting(
                id = 44556,
                validationDate = ZonedDateTime.parse("2024-04-01T12:00:00Z"),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.MISSING_FAR_48_HOURS_ALERT,
            )

        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            listOf(alertReporting1, alertReporting2, infractionReporting, alertReporting3),
        )

        // When
        val result =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                null,
                "FR55667788",
                "1234567",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(result.current).hasSize(3)

        val firstResult = result.current[0]
        assertThat(firstResult.reporting.id).isEqualTo(44556)
        assertThat((firstResult.reporting.value as Alert).type).isEqualTo(
            AlertType.MISSING_FAR_48_HOURS_ALERT,
        )
        assertThat(firstResult.otherOccurrencesOfSameAlert).isEmpty()

        val secondResult = result.current[1]
        assertThat(secondResult.reporting.id).isEqualTo(33445)
        assertThat(secondResult.reporting.type).isEqualTo(ReportingType.INFRACTION_SUSPICION)
        assertThat(secondResult.otherOccurrencesOfSameAlert).isEmpty()

        val thirdResult = result.current[2]
        assertThat(thirdResult.reporting.id).isEqualTo(22334)
        assertThat((thirdResult.reporting.value as Alert).type).isEqualTo(
            AlertType.POSITION_ALERT,
        )
        assertThat(thirdResult.otherOccurrencesOfSameAlert).hasSize(1)
        assertThat(thirdResult.otherOccurrencesOfSameAlert[0].id).isEqualTo(11223)
        assertThat((thirdResult.otherOccurrencesOfSameAlert[0].value as Alert).type).isEqualTo(
            AlertType.POSITION_ALERT,
        )
    }

    @Test
    fun `execute Should build the infraction suspicion summary`() {
        // Given
        val alertReporting1 =
            createCurrentReporting(
                id = 11223,
                validationDate = ZonedDateTime.now().minusMonths(11),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
                isArchived = true,
            )

        val alertReporting2 =
            createCurrentReporting(
                id = 22334,
                validationDate = ZonedDateTime.now().minusMonths(11),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.POSITION_ALERT,
                isArchived = true,
            )

        val infractionReporting =
            createCurrentReporting(
                id = 33445,
                validationDate = ZonedDateTime.now().minusMonths(10),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.INFRACTION_SUSPICION,
                alertType = null,
                isArchived = true,
                natinfCode = 7059,
            )

        val infractionReporting2 =
            createCurrentReporting(
                id = 33456,
                validationDate = ZonedDateTime.now().minusMonths(8),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.INFRACTION_SUSPICION,
                alertType = null,
                isArchived = true,
            )

        val alertReporting3 =
            createCurrentReporting(
                id = 44556,
                validationDate = ZonedDateTime.now().minusMonths(7),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.ALERT,
                alertType = AlertType.MISSING_FAR_48_HOURS_ALERT,
                isArchived = true,
            )

        val observation =
            createCurrentReporting(
                id = 44558,
                validationDate = ZonedDateTime.now().minusMonths(4),
                internalReferenceNumber = "FR55667788",
                type = ReportingType.OBSERVATION,
                alertType = null,
                isArchived = true,
            )

        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            listOf(
                alertReporting1,
                alertReporting2,
                infractionReporting,
                infractionReporting2,
                alertReporting3,
                observation,
            ),
        )

        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            Infraction(
                natinfCode = 7059,
                infraction = "Peche maritime non autorisee dans les eaux maritimes ou salees francaises par un navire de pays tiers a l'union europeenne",
                infractionCategory = InfractionCategory.FISHING,
            ),
        )

        // When
        val result =
            GetVesselReportings(
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute(
                null,
                "FR55667788",
                "1234567",
                "IRCS",
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ZonedDateTime.now().minusYears(1),
            )

        // Then
        assertThat(result.summary.numberOfInfractionSuspicions).isEqualTo(5)
        assertThat(result.summary.numberOfObservations).isEqualTo(1)

        val infractionSuspicionsSummary = result.summary.infractionSuspicionsSummary
        assertThat(result.summary.infractionSuspicionsSummary).hasSize(4)
        assertThat(infractionSuspicionsSummary[0].numberOfOccurrences).isEqualTo(2)
        assertThat(
            infractionSuspicionsSummary[0].title,
        ).isEqualTo("Chalutage dans les 3 milles (NATINF 7059)")
        assertThat(infractionSuspicionsSummary[1].numberOfOccurrences).isEqualTo(1)
        assertThat(
            infractionSuspicionsSummary[1].title,
        ).isEqualTo("FAR manquant en 48h (NATINF 27689)")
        assertThat(infractionSuspicionsSummary[2].numberOfOccurrences).isEqualTo(1)
        assertThat(
            infractionSuspicionsSummary[2].title,
        ).isEqualTo(
            "Peche maritime non autorisee dans les eaux maritimes ou salees francaises par un navire de pays tiers a l'union europeenne (NATINF 7059)",
        )
        assertThat(infractionSuspicionsSummary[3].numberOfOccurrences).isEqualTo(1)
        assertThat(infractionSuspicionsSummary[3].title).isEqualTo("NATINF 123456")
    }
}
