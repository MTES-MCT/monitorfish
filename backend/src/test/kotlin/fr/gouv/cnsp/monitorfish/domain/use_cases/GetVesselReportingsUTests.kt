package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
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

    @MockBean
    private lateinit var getAllControlUnits: GetAllControlUnits

    @Test
    fun `execute Should return the reporting of a specified vessel When vessel id is null`() {
        // Given
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction(
                natinfCode = 7059,
                infractionCategory = InfractionCategory.FISHING,
            ),
        )
        given(reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(any(), any(), any())).willReturn(
            TestUtils.getDummyReportings(),
        )

        // When
        val currentAndArchivedReportings = GetVesselReportings(
            reportingRepository,
            infractionRepository,
            getAllControlUnits,
        ).execute(
            null,
            "FR224226850",
            "1236514",
            "IRCS",
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            ZonedDateTime.now().minusYears(1),
        )

        // Then
        assertThat(currentAndArchivedReportings.current).hasSize(2)
        val (currentReporting, _) = currentAndArchivedReportings.current.first()
        assertThat(currentReporting.isArchived).isFalse
        assertThat(currentReporting.infraction?.natinfCode).isEqualTo(7059)
        assertThat(currentAndArchivedReportings.archived).hasSize(1)
        val (archivedReporting, _) = currentAndArchivedReportings.archived.first()
        assertThat(archivedReporting.isArchived).isTrue
    }

    @Test
    fun `execute Should return the reporting of a specified vessel When vessel id is not null`() {
        // Given
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(
            Infraction(
                natinfCode = 7059,
                infractionCategory = InfractionCategory.FISHING,
            ),
        )
        given(reportingRepository.findCurrentAndArchivedByVesselIdEquals(eq(123456), any())).willReturn(
            TestUtils.getDummyReportings(),
        )

        // When
        val currentAndArchivedReportings = GetVesselReportings(
            reportingRepository,
            infractionRepository,
            getAllControlUnits,
        ).execute(
            123456,
            "FR224226850",
            "1236514",
            "IRCS",
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            ZonedDateTime.now().minusYears(1),
        )

        // Then
        assertThat(currentAndArchivedReportings.current).hasSize(2)
        assertThat(currentAndArchivedReportings.archived).hasSize(1)
    }
}
