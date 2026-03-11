package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront.NAMO
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
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
class UpdateReportingUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var getReportingWithDMLAndSeaFront: GetReportingWithDMLAndSeaFront

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    @Test
    fun `execute Should throw an exception When the reporting is an alert`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting.Alert(
                id = 1,
                type = ReportingType.ALERT,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
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
            ),
        )

        // When
        val throwable =
            catchThrowable {
                UpdateReporting(reportingRepository, getReportingWithDMLAndSeaFront, getAllLegacyControlUnits)
                    .execute(
                        1,
                        ReportingUpdateCommand(
                            flagState = CountryCode.FR,
                            latitude = null,
                            longitude = null,
                            reportingSource = ReportingSource.UNIT,
                            type = ReportingType.OBSERVATION,
                            reportingDate = ZonedDateTime.now(),
                            title = "A reporting",
                        ),
                    )
            }

        // Then
        assertThat(throwable.message).contains("The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION")
    }

    @Test
    fun `execute Should throw an exception When the new reporting type is not allowed`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                title = "Test",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            ),
        )

        // When
        val throwable =
            catchThrowable {
                UpdateReporting(reportingRepository, getReportingWithDMLAndSeaFront, getAllLegacyControlUnits)
                    .execute(
                        1,
                        ReportingUpdateCommand(
                            flagState = CountryCode.FR,
                            latitude = null,
                            longitude = null,
                            reportingSource = ReportingSource.UNIT,
                            type = ReportingType.ALERT,
                            title = "A reporting",
                        ),
                    )
            }

        // Then
        assertThat(throwable).isInstanceOf(NotImplementedError::class.java)
    }

    @ParameterizedTest
    @EnumSource(ReportingSource::class)
    fun `execute Should throw an exception When fields of reporting actor are not rights`(
        reportingSource: ReportingSource,
    ) {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                title = "Test",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>())).willReturn(reporting)
        given(getReportingWithDMLAndSeaFront.execute(any()))
            .willReturn(reporting.copy(reportingSource = reportingSource))

        // When
        val throwable =
            catchThrowable {
                UpdateReporting(reportingRepository, getReportingWithDMLAndSeaFront, getAllLegacyControlUnits)
                    .execute(
                        1,
                        ReportingUpdateCommand(
                            flagState = CountryCode.FR,
                            latitude = null,
                            longitude = null,
                            reportingSource = reportingSource,
                            type = ReportingType.INFRACTION_SUSPICION,
                            reportingDate = ZonedDateTime.now(),
                            title = "A reporting",
                            natinfCode = 123456,
                            threat = "Obligations déclaratives",
                            threatCharacterization = "DEP",
                        ),
                    )
            }

        // Then
        when (reportingSource) {
            ReportingSource.OPS -> assertThat(throwable).isNull()
            ReportingSource.SIP -> assertThat(throwable).isNull()
            ReportingSource.SATELLITE -> assertThat(throwable).isNull()
            ReportingSource.UNIT -> assertThat(throwable.message).contains("An unit must be set")
            ReportingSource.DML -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingSource.DIRM -> assertThat(throwable.message).contains("An author contact must be set")
            ReportingSource.OTHER -> assertThat(throwable.message).contains("An author contact must be set")
        }
    }

    @Test
    fun `execute Should throw an exception When NATINF code is not set`() {
        // Given
        given(reportingRepository.findById(any())).willReturn(
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                title = "Test",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            ),
        )

        // When
        val throwable =
            catchThrowable {
                UpdateReporting(
                    reportingRepository,
                    getReportingWithDMLAndSeaFront,
                    getAllLegacyControlUnits,
                ).execute(
                    1,
                    ReportingUpdateCommand(
                        flagState = CountryCode.FR,
                        latitude = null,
                        longitude = null,
                        reportingSource = ReportingSource.UNIT,
                        type = ReportingType.INFRACTION_SUSPICION,
                        reportingDate = ZonedDateTime.now(),
                        title = "A reporting",
                        threat = "Obligations déclaratives",
                        threatCharacterization = "DEP",
                    ),
                )
            }

        // Then
        assertThat(throwable.message).contains("NATINF code is required")
    }

    @Test
    fun `execute Should update the reporting`() {
        // Given
        val expectedExpirationDate = ZonedDateTime.now().plusDays(2)
        val reporting =
            Reporting.Observation(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                expirationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                title = "A title",
                description = "Before update",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>())).willReturn(reporting)
        given(
            getReportingWithDMLAndSeaFront.execute(any()),
        ).willReturn(reporting.copy(description = "Test 2"))

        // When
        UpdateReporting(
            reportingRepository,
            getReportingWithDMLAndSeaFront,
            getAllLegacyControlUnits,
        ).execute(
            1,
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                latitude = null,
                longitude = null,
                reportingSource = ReportingSource.UNIT,
                type = ReportingType.OBSERVATION,
                controlUnitId = 1,
                expirationDate = expectedExpirationDate,
                reportingDate = ZonedDateTime.now(),
                title = "A reporting",
                description = "Test 2",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
            ),
        )

        // Then
        argumentCaptor<Reporting.Observation>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().description).isEqualTo("Test 2")
        }
    }

    @Test
    fun `execute Should update the reporting type`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                authorContact = "An actor",
                title = "Test",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>())).willReturn(reporting)
        given(getReportingWithDMLAndSeaFront.execute(any())).willAnswer { invocation ->
            invocation.getArgument<Reporting>(0)
        }
        // When
        UpdateReporting(
            reportingRepository,
            getReportingWithDMLAndSeaFront,
            getAllLegacyControlUnits,
        ).execute(
            1,
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                latitude = null,
                longitude = null,
                reportingSource = ReportingSource.UNIT,
                type = ReportingType.OBSERVATION,
                controlUnitId = 1,
                reportingDate = ZonedDateTime.now(),
                title = "A reporting",
                description = "Test 2",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
            ),
        )

        // Then
        argumentCaptor<Reporting.Observation>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().description).isEqualTo("Test 2")
            assertThat(allValues.first().type.toString()).isEqualTo(ReportingType.OBSERVATION.toString())
        }
    }

    @Test
    fun `execute Should add the flagState, the DML and the sea front of the reporting When the reporting is an INFRACTION_SUSPICION`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                controlUnitId = 1,
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                authorContact = "A contact",
                title = "Test",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>())).willReturn(reporting)
        given(getReportingWithDMLAndSeaFront.execute(any())).willReturn(
            reporting.copy(
                dml = "DML 56",
                seaFront = "NAMO",
            ),
        )

        // When
        UpdateReporting(
            reportingRepository,
            getReportingWithDMLAndSeaFront,
            getAllLegacyControlUnits,
        ).execute(
            1,
            ReportingUpdateCommand(
                flagState = CountryCode.FR,
                latitude = null,
                longitude = null,
                reportingSource = ReportingSource.UNIT,
                type = ReportingType.INFRACTION_SUSPICION,
                controlUnitId = 1,
                reportingDate = ZonedDateTime.now(),
                title = "A reporting",
                natinfCode = 1234,
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
            ),
        )

        // Then
        argumentCaptor<Reporting.InfractionSuspicion>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().dml).isEqualTo("DML 56")
            assertThat(allValues.first().seaFront).isEqualTo("NAMO")
        }
    }

    @Test
    fun `execute Should add the flagState of the previous reporting When the reporting is an OBSERVATION`() {
        // Given
        val reporting =
            Reporting.Observation(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                title = "Test",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>())).willReturn(reporting)
        given(getReportingWithDMLAndSeaFront.execute(any())).willReturn(
            reporting.copy(controlUnitId = 1),
        )

        // When
        val returnedReporting =
            UpdateReporting(
                reportingRepository,
                getReportingWithDMLAndSeaFront,
                getAllLegacyControlUnits,
            ).execute(
                1,
                ReportingUpdateCommand(
                    flagState = CountryCode.FR,
                    latitude = null,
                    longitude = null,
                    reportingSource = ReportingSource.UNIT,
                    type = ReportingType.OBSERVATION,
                    controlUnitId = 1,
                    reportingDate = ZonedDateTime.now(),
                    title = "A reporting",
                    natinfCode = 1234,
                    threat = "Obligations déclaratives",
                    threatCharacterization = "DEP",
                ),
            )

        // Then
        argumentCaptor<Reporting.Observation>().apply {
            verify(reportingRepository).update(any(), capture())
        }
        assertThat(returnedReporting.first.flagState).isEqualTo(CountryCode.FR)
    }

    @Test
    fun `execute Should migrate an OBSERVATION reporting to an INFRACTION_SUSPICION`() {
        // Given
        val reporting =
            Reporting.Observation(
                id = 1,
                type = ReportingType.OBSERVATION,
                vesselName = "BIDUBULE",
                cfr = "FR224226850",
                externalMarker = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                reportingDate = ZonedDateTime.now(),
                lastUpdateDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 1,
                authorContact = "An actor",
                title = "Test",
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
            )
        given(reportingRepository.findById(any())).willReturn(reporting)
        given(reportingRepository.update(any(), isA<Reporting>()))
            .willReturn(reporting)
        given(getReportingWithDMLAndSeaFront.execute(any()))
            .willAnswer { invocation ->
                invocation.getArgument<Reporting>(0)
            }

        // When
        UpdateReporting(
            reportingRepository,
            getReportingWithDMLAndSeaFront,
            getAllLegacyControlUnits,
        ).execute(
            reportingId = 1,
            reportingUpdateCommand =
                ReportingUpdateCommand(
                    flagState = CountryCode.FR,
                    latitude = null,
                    longitude = null,
                    reportingSource = ReportingSource.UNIT,
                    type = ReportingType.INFRACTION_SUSPICION,
                    controlUnitId = 1,
                    reportingDate = ZonedDateTime.now(),
                    title = "A reporting",
                    natinfCode = 1234,
                    threat = "Obligations déclaratives",
                    threatCharacterization = "DEP",
                ),
        )

        // Then
        argumentCaptor<Reporting.InfractionSuspicion>().apply {
            verify(reportingRepository).update(any(), capture())

            assertThat(allValues.first().type.toString()).isEqualTo(ReportingType.INFRACTION_SUSPICION.name)
        }
    }
}
