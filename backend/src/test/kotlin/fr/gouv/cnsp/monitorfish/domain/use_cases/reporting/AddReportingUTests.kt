package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AddReportingUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var getReportingWithDMLAndSeaFront: GetReportingWithDMLAndSeaFront

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    @Test
    fun `execute Should throw an exception When the reporting is an alert`() {
        // Given
        val reportingToAdd =
            Reporting.Alert(
                id = 1,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                alertType = AlertType.POSITION_ALERT,
                seaFront = NAMO.toString(),
                alertId = 1,
                natinfCode = 7059,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                name = "Chalutage dans les 3 milles",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )

        // When
        val throwable =
            catchThrowable {
                AddReporting(
                    reportingRepository,
                    getReportingWithDMLAndSeaFront,
                    getAllLegacyControlUnits,
                ).execute(
                    reportingToAdd,
                )
            }

        // Then
        assertThat(throwable.message).contains("The reporting type must be OBSERVATION or INFRACTION_SUSPICION")
    }

    @ParameterizedTest
    @EnumSource(ReportingActor::class)
    fun `execute Should throw an exception When fields of reporting actor are not rights`(
        reportingActor: ReportingActor,
    ) {
        // Given
        val reportingToAdd =
            Reporting.Observation(
                id = 1,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingActor = reportingActor,
                title = "A title",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )

        val enrichedReporting =
            reportingToAdd.copy(
                dml = "DML 56",
                seaFront = "NAMO",
            )
        given(getReportingWithDMLAndSeaFront.execute(any())).willReturn(enrichedReporting)
        given(reportingRepository.save(any())).willReturn(reportingToAdd)

        // When
        val throwable =
            catchThrowable {
                AddReporting(
                    reportingRepository,
                    getReportingWithDMLAndSeaFront,
                    getAllLegacyControlUnits,
                ).execute(
                    reportingToAdd,
                )
            }

        // Then
        when (reportingActor) {
            ReportingActor.OPS -> assertThat(throwable).isNull()
            ReportingActor.SIP -> assertThat(throwable).isNull()
            ReportingActor.UNIT -> assertThat(throwable.message).contains("An unit must be set")
            ReportingActor.DML -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingActor.DIRM -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingActor.OTHER -> assertThat(throwable.message).contains("An author contact must be set")
        }
    }

    @Test
    fun `execute Should add a new reporting When the type is an INFRACTION_SUSPICION`() {
        // Given
        val reportingToAdd =
            Reporting.InfractionSuspicion(
                id = 1,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingActor = ReportingActor.OPS,
                natinfCode = 1235,
                title = "Chalut en boeuf illégal",
                threat = "Mesures techniques et de conservation",
                threatCharacterization = "Engin",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )

        val enrichedReporting =
            reportingToAdd.copy(
                seaFront = "NAMO",
                dml = "DML 17",
            )
        given(getReportingWithDMLAndSeaFront.execute(any())).willReturn(enrichedReporting)
        given(reportingRepository.save(any())).willReturn(enrichedReporting)

        // When
        AddReporting(reportingRepository, getReportingWithDMLAndSeaFront, getAllLegacyControlUnits).execute(
            reportingToAdd,
        )

        // Then
        argumentCaptor<Reporting>().apply {
            verify(reportingRepository).save(capture())

            val savedReporting = allValues.first() as Reporting.InfractionSuspicion
            assertThat(savedReporting.seaFront).isEqualTo("NAMO")
            assertThat(savedReporting.dml).isEqualTo("DML 17")
        }
    }
}
