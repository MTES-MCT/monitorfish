package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetAllCurrentReportingsUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    @Test
    fun `execute Should get all reportings with the underCharter and infractions fields`() {
        // Given
        val currentReporting =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = "FRFGRGR",
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingActor = ReportingActor.OPS,
                natinfCode = 27689,
                title = "A title",
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findAll(any())).willReturn(listOf(currentReporting))
        given(
            vesselRepository.findUnderCharterForVessel(
                eq(VesselIdentifier.INTERNAL_REFERENCE_NUMBER),
                eq("FRFGRGR"),
            ),
        ).willReturn(true)
        BDDMockito.given(infractionRepository.findInfractionByNatinfCode(eq(27689))).willReturn(
            Infraction(
                natinfCode = 27689,
                infraction = "Peche maritime non autorisee dans les eaux maritimes ou salees francaises par un navire de pays tiers a l'union europeenne",
                infractionCategory = InfractionCategory.FISHING,
            ),
        )

        // When
        val reportings =
            GetAllCurrentReportings(
                reportingRepository,
                vesselRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute()

        // Then
        assertThat(reportings).hasSize(1)
        val (reporting, _) = reportings.first()
        assertThat(reporting.internalReferenceNumber).isEqualTo("FRFGRGR")
        assertThat(reporting.underCharter).isTrue
        assertThat(reporting.infraction).isNotNull
    }

    @Test
    fun `execute Should not throw an exception When a last position is not found to obtain the underCharter field`() {
        // Given
        val currentReporting =
            Reporting.InfractionSuspicion(
                internalReferenceNumber = null,
                externalReferenceNumber = "RGD",
                ircs = "6554fEE",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingActor = ReportingActor.OPS,
                natinfCode = 123456,
                title = "A title",
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation par navire tiers",
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findAll()).willReturn(listOf(currentReporting))

        // When
        val throwable =
            catchThrowable {
                GetAllCurrentReportings(
                    reportingRepository,
                    vesselRepository,
                    infractionRepository,
                    getAllLegacyControlUnits,
                ).execute()
            }

        // Then
        assertThat(throwable).isNull()
    }
}
