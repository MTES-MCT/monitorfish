package fr.gouv.cnsp.monitorfish.domain.use_cases

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.ThreeMilesTrawlingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.GetInfractionSuspicionWithDMLAndSeaFront
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdateReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class UpdateReportingUTests {

    @MockBean
    private lateinit var reportingRepository: ReportingRepository

    @MockBean
    private lateinit var getInfractionSuspicionWithDMLAndSeaFront: GetInfractionSuspicionWithDMLAndSeaFront

    @Test
    fun `execute Should throw an exception When the reporting is an alert`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
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
            )
        )

        // When
        val throwable = catchThrowable {
            UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront)
                .execute(
                    1,
                    UpdatedInfractionSuspicionOrObservation(
                        reportingActor = ReportingActor.UNIT,
                        reportingType = ReportingType.OBSERVATION,
                        title = "A reporting"
                    )
                )
        }

        // Then
        assertThat(throwable.message).contains("The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION")
    }

    @Test
    fun `execute Should throw an exception When the new reporting type is not allowed`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = InfractionSuspicion(reportingActor = ReportingActor.UNIT, title = "Test", natinfCode = "1234") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )

        // When
        val throwable = catchThrowable {
            UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront)
                .execute(
                    1,
                    UpdatedInfractionSuspicionOrObservation(
                        reportingActor = ReportingActor.UNIT,
                        reportingType = ReportingType.ALERT,
                        title = "A reporting"
                    )
                )
        }

        // Then
        assertThat(throwable.message).contains(
            "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION"
        )
    }

    @ParameterizedTest
    @EnumSource(ReportingActor::class)
    fun `execute Should throw an exception When fields of reporting actor are not rights`(
        reportingActor: ReportingActor
    ) {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = InfractionSuspicion(reportingActor = ReportingActor.UNIT, title = "Test", natinfCode = "1234") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )
        given(getInfractionSuspicionWithDMLAndSeaFront.execute(any(), anyOrNull())).willReturn(
            InfractionSuspicion(reportingActor = reportingActor, title = "Test", natinfCode = "1234")
        )

        // When
        val throwable = catchThrowable {
            UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront)
                .execute(
                    1,
                    UpdatedInfractionSuspicionOrObservation(
                        reportingActor = reportingActor,
                        reportingType = ReportingType.INFRACTION_SUSPICION,
                        title = "A reporting",
                        natinfCode = "123456"
                    )
                )
        }

        // Then
        when (reportingActor) {
            ReportingActor.OPS -> assertThat(throwable.message).contains("An author trigram must be set")
            ReportingActor.SIP -> assertThat(throwable.message).contains("An author trigram must be set")
            ReportingActor.UNIT -> assertThat(throwable.message).contains("An unit must be set")
            ReportingActor.DML -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingActor.DIRM -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingActor.OTHER -> assertThat(throwable.message).contains("An author contact must be set")
        }
    }

    @Test
    fun `execute Should throw an exception When NATINF code is not set`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = InfractionSuspicion(reportingActor = ReportingActor.UNIT, title = "Test", natinfCode = "1234") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )

        // When
        val throwable = catchThrowable {
            UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
                1,
                UpdatedInfractionSuspicionOrObservation(
                    reportingActor = ReportingActor.UNIT,
                    reportingType = ReportingType.INFRACTION_SUSPICION,
                    title = "A reporting"
                )
            )
        }

        // Then
        assertThat(throwable.message).contains("NATINF code should not be null or empty")
    }

    @Test
    fun `execute Should update the reporting`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = Observation(
                    reportingActor = ReportingActor.UNIT,
                    unit = "OPS",
                    title = "A title",
                    description = "Before update"
                ) as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )

        // When
        UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
            1,
            UpdatedInfractionSuspicionOrObservation(
                reportingActor = ReportingActor.UNIT,
                reportingType = ReportingType.OBSERVATION,
                unit = "AN UNIT",
                title = "A reporting",
                description = "Test 2",
                natinfCode = "1234"
            )
        )

        // Then
        argumentCaptor<Observation>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().description).isEqualTo("Test 2")
        }
    }

    @Test
    fun `execute Should update the reporting type`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = InfractionSuspicion(reportingActor = ReportingActor.UNIT, title = "Test", natinfCode = "1234") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )

        // When
        UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
            1,
            UpdatedInfractionSuspicionOrObservation(
                reportingActor = ReportingActor.UNIT,
                reportingType = ReportingType.OBSERVATION,
                unit = "AN UNIT",
                title = "A reporting",
                description = "Test 2",
                natinfCode = "1234"
            )
        )

        // Then
        argumentCaptor<Observation>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().description).isEqualTo("Test 2")
            assertThat(allValues.first().natinfCode).isNull()
            assertThat(allValues.first().type.toString()).isEqualTo(ReportingType.OBSERVATION.toString())
        }
    }

    @Test
    fun `execute Should add the flagState, the DML and the sea front of the reporting When the reporting is an INFRACTION_SUSPICION`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = InfractionSuspicion(
                    reportingActor = ReportingActor.UNIT,
                    title = "Test",
                    natinfCode = "1234",
                    flagState = "FR"
                ) as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )
        given(getInfractionSuspicionWithDMLAndSeaFront.execute(any(), anyOrNull())).willReturn(
            InfractionSuspicion(
                reportingActor = ReportingActor.UNIT,
                unit = "AN UNIT",
                title = "Test",
                natinfCode = "1234",
                flagState = "FR",
                dml = "DML 56",
                seaFront = "NAMO"
            )
        )

        // When
        UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
            1,
            UpdatedInfractionSuspicionOrObservation(
                reportingActor = ReportingActor.UNIT,
                reportingType = ReportingType.INFRACTION_SUSPICION,
                unit = "AN UNIT",
                title = "A reporting",
                natinfCode = "1234"
            )
        )

        // Then
        argumentCaptor<InfractionSuspicion>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().flagState).isEqualTo("FR")
            assertThat(allValues.first().dml).isEqualTo("DML 56")
            assertThat(allValues.first().seaFront).isEqualTo("NAMO")
        }
    }

    @Test
    fun `execute Should add the flagState of the previous reporting When the reporting is an OBSERVATION`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = Observation(reportingActor = ReportingActor.UNIT, title = "Test", flagState = "FR") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )

        // When
        UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
            1,
            UpdatedInfractionSuspicionOrObservation(
                reportingActor = ReportingActor.UNIT,
                reportingType = ReportingType.OBSERVATION,
                unit = "AN UNIT",
                title = "A reporting",
                natinfCode = "1234"
            )
        )

        // Then
        argumentCaptor<Observation>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().flagState).isEqualTo("FR")
        }
    }

    @Test
    fun `execute Should migrate an OBSERVATION reporting to an INFRACTION_SUSPICION`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                value = Observation(reportingActor = ReportingActor.UNIT, title = "Test", flagState = "FR") as ReportingValue,
                isArchived = false,
                isDeleted = false
            )
        )
        given(getInfractionSuspicionWithDMLAndSeaFront.execute(any(), anyOrNull())).willReturn(
            InfractionSuspicion(
                reportingActor = ReportingActor.OPS,
                seaFront = "NAMO",
                dml = "DML 17",
                natinfCode = "1235",
                authorTrigram = "LTH",
                title = "Chalut en boeuf illégal"
            )
        )

        // When
        UpdateReporting(reportingRepository, getInfractionSuspicionWithDMLAndSeaFront).execute(
            1,
            UpdatedInfractionSuspicionOrObservation(
                reportingActor = ReportingActor.UNIT,
                reportingType = ReportingType.INFRACTION_SUSPICION,
                unit = "AN UNIT",
                title = "A reporting",
                natinfCode = "1234"
            )
        )

        // Then
        argumentCaptor<InfractionSuspicion>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().type.toString()).isEqualTo(ReportingType.INFRACTION_SUSPICION.name)
            assertThat(allValues.first().dml).isEqualTo("DML 17")
        }
    }
}
