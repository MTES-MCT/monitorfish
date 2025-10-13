package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.AddReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetReportingWithDMLAndSeaFront
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import org.mockito.Mock
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AddReportingUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @Mock
    private lateinit var getReportingWithDMLAndSeaFront: GetReportingWithDMLAndSeaFront

    @Mock
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    @Test
    fun `execute Should throw an exception When the reporting is an alert`() {
        // Given
        val reportingToAdd =
            Reporting(
                id = 1,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value =
                    Alert(
                        type = AlertType.POSITION_ALERT,
                        seaFront = NAMO.toString(),
                        alertId = 1,
                        natinfCode = 7059,
                        name = "Chalutage dans les 3 milles",
                    ) as ReportingValue,
                isArchived = false,
                isDeleted = false,
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
            Reporting(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value =
                    Observation(
                        reportingActor = reportingActor,
                        authorTrigram = "LTH",
                        title = "A title",
                    ),
                isArchived = false,
                isDeleted = false,
            )
        given(getReportingWithDMLAndSeaFront.execute(any(), anyOrNull())).willReturn(
            Observation(
                reportingActor = reportingActor,
                authorTrigram = "LTH",
                title = "A title",
                dml = "DML 56",
                seaFront = "NAMO",
            ),
        )
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
        given(getReportingWithDMLAndSeaFront.execute(any(), anyOrNull())).willReturn(
            InfractionSuspicion(
                reportingActor = ReportingActor.OPS,
                seaFront = "NAMO",
                dml = "DML 17",
                natinfCode = 1235,
                authorTrigram = "LTH",
                title = "Chalut en boeuf illégal",
            ),
        )
        val reportingToAdd =
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value =
                    InfractionSuspicion(
                        reportingActor = ReportingActor.OPS,
                        natinfCode = 1235,
                        authorTrigram = "LTH",
                        title = "Chalut en boeuf illégal",
                    ),
                isArchived = false,
                isDeleted = false,
            )
        given(reportingRepository.save(any())).willReturn(reportingToAdd)

        // When
        AddReporting(reportingRepository, getReportingWithDMLAndSeaFront, getAllLegacyControlUnits).execute(
            reportingToAdd,
        )

        // Then
        argumentCaptor<Reporting>().apply {
            verify(reportingRepository).save(capture())

            val infraction = allValues.first().value as InfractionSuspicion
            assertThat(infraction.seaFront).isEqualTo("NAMO")
            assertThat(infraction.dml).isEqualTo("DML 17")
        }
    }
}
