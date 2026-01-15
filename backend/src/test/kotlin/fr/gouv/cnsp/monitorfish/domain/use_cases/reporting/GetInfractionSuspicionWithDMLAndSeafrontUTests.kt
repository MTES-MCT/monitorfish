package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetInfractionSuspicionWithDMLAndSeafrontUTests {
    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var districtRepository: DistrictRepository

    @Test
    fun `execute Should add the seaFront and the DML When the vessel id is given`() {
        // Given
        val expectedInfractionSuspicion =
            Reporting.InfractionSuspicion(
                id = 1,
                type = ReportingType.INFRACTION_SUSPICION,
                vesselName = "BIDUBULE",
                internalReferenceNumber = "FR224226850",
                externalReferenceNumber = "1236514",
                ircs = "IRCS",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                vesselId = 123,
                flagState = CountryCode.FR,
                creationDate = ZonedDateTime.now(),
                validationDate = ZonedDateTime.now(),
                isArchived = false,
                isDeleted = false,
                createdBy = "test@example.gouv.fr",
                reportingActor = ReportingActor.OPS,
                dml = "DML 17",
                natinfCode = 1235,
                authorTrigram = "LTH",
                title = "Chalut en boeuf illégal",
                threat = "Obligations déclaratives",
                threatCharacterization = "DEP",
            )

        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 123, districtCode = "LO", flagState = CountryCode.FR, hasLogbookEsacapt = false),
        )
        given(districtRepository.find(eq("LO")))
            .willReturn(District("LO", "Lorient", "56", "Morbihan", "DML 56", "NAMO"))

        // When
        val infractionSuspicion =
            GetReportingWithDMLAndSeaFront(
                vesselRepository,
                districtRepository,
            ).execute(
                reporting = expectedInfractionSuspicion,
            )

        // Then
        assertThat(infractionSuspicion.seaFront).isEqualTo("NAMO")
        assertThat(infractionSuspicion.dml).isEqualTo("DML 56")
    }

    @Test
    fun `execute Should not throw an exception When the vessel id is not found`() {
        // When
        val throwable =
            catchThrowable {
                GetReportingWithDMLAndSeaFront(vesselRepository, districtRepository).execute(
                    reporting =
                        Reporting.InfractionSuspicion(
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
                            isArchived = false,
                            isDeleted = false,
                            createdBy = "test@example.gouv.fr",
                            reportingActor = ReportingActor.OPS,
                            dml = "",
                            natinfCode = 1235,
                            authorTrigram = "LTH",
                            title = "Chalut en boeuf illégal",
                            threat = "Obligations déclaratives",
                            threatCharacterization = "DEP",
                        ),
                )
            }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should not throw an exception When the vessel is not found`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(null)

        // When
        val throwable =
            catchThrowable {
                GetReportingWithDMLAndSeaFront(vesselRepository, districtRepository).execute(
                    reporting =
                        Reporting.InfractionSuspicion(
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
                            isArchived = false,
                            isDeleted = false,
                            createdBy = "test@example.gouv.fr",
                            reportingActor = ReportingActor.OPS,
                            dml = "",
                            natinfCode = 1235,
                            authorTrigram = "LTH",
                            title = "Chalut en boeuf illégal",
                            threat = "Obligations déclaratives",
                            threatCharacterization = "DEP",
                        ),
                )
            }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should not throw an exception When the district is not found`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 1, flagState = CountryCode.FR, districtCode = "LO", hasLogbookEsacapt = false),
        )
        given(districtRepository.find(eq("LO")))
            .willThrow(CodeNotFoundException("oupsi"))

        // When
        val throwable =
            catchThrowable {
                GetReportingWithDMLAndSeaFront(vesselRepository, districtRepository).execute(
                    reporting =
                        Reporting.InfractionSuspicion(
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
                            isArchived = false,
                            isDeleted = false,
                            createdBy = "test@example.gouv.fr",
                            reportingActor = ReportingActor.OPS,
                            dml = "",
                            natinfCode = 1235,
                            authorTrigram = "LTH",
                            title = "Chalut en boeuf illégal",
                            threat = "Obligations déclaratives",
                            threatCharacterization = "DEP",
                        ),
                )
            }

        // Then
        assertThat(throwable).isNull()
    }
}
