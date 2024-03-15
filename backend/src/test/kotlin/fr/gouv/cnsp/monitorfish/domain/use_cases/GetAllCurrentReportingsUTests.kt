package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetAllCurrentReportings
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetAllCurrentReportingsUTests {
    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockBean
    private lateinit var getAllControlUnits: GetAllControlUnits

    @Test
    fun `execute Should get all reportings with the underCharter field`() {
        // Given
        val currentReporting =
            Reporting(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                value =
                    InfractionSuspicion(
                        ReportingActor.OPS,
                        natinfCode = 123456,
                        authorTrigram = "LTH",
                        title = "A title",
                    ),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
            )
        given(reportingRepository.findAll(any())).willReturn(listOf(currentReporting))
        given(
            lastPositionRepository.findUnderCharterForVessel(
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                eq("FRFGRGR"),
            ),
        )
            .willReturn(true)

        // When
        val reportings =
            GetAllCurrentReportings(
                reportingRepository,
                lastPositionRepository,
                getAllControlUnits,
            ).execute()

        // Then
        assertThat(reportings).hasSize(1)
        val (reporting, _) = reportings.first()
        assertThat(reporting.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reporting.underCharter).isTrue
    }

    @Test
    fun `execute Should not throw an exception When a last position is not found to obtain the underCharter field`() {
        // Given
        val currentReporting =
            Reporting(
                internalReferenceNumber = null,
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                value =
                    InfractionSuspicion(
                        ReportingActor.OPS,
                        natinfCode = 123456,
                        authorTrigram = "LTH",
                        title = "A title",
                    ),
                type = ReportingType.INFRACTION_SUSPICION,
                isDeleted = false,
                isArchived = false,
            )
        given(reportingRepository.findAll()).willReturn(listOf(currentReporting))

        // When
        val throwable =
            catchThrowable {
                GetAllCurrentReportings(reportingRepository, lastPositionRepository, getAllControlUnits).execute()
            }

        // Then
        assertThat(throwable).isNull()
    }
}
