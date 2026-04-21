package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.district.District
import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FacadeAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetReportingWithDMLAndSeaFrontUTests {
    @MockitoBean
    private lateinit var vesselRepository: VesselRepository

    @MockitoBean
    private lateinit var districtRepository: DistrictRepository

    @MockitoBean
    private lateinit var facadeAreasRepository: FacadeAreasRepository

    private val lorientDistrict = District("LO", "Lorient", "56", "Morbihan", "DML 56", "NAMO")
    private val namoFacadeArea =
        FacadeArea(facade = "NAMO", geometry = GeometryFactory().createPoint(Coordinate(0.0, 0.0)))

    @Test
    fun `execute Should add the dml and seaFront When the vessel and district are found for an InfractionSuspicion`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 123, districtCode = "LO", flagState = CountryCode.FR, hasLogbookEsacapt = false),
        )
        given(districtRepository.find(eq("LO"))).willReturn(lorientDistrict)

        // When
        val result =
            useCase().execute(
                anInfractionSuspicion(vesselId = 123),
            )

        // Then
        assertThat(result.dml).isEqualTo("DML 56")
        assertThat(result.seaFront).isEqualTo("NAMO")
    }

    @Test
    fun `execute Should add the dml and seaFront When the vessel and district are found for an Observation`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 123, districtCode = "LO", flagState = CountryCode.FR, hasLogbookEsacapt = false),
        )
        given(districtRepository.find(eq("LO"))).willReturn(lorientDistrict)

        // When
        val result =
            useCase().execute(
                anObservation(vesselId = 123),
            )

        // Then
        assertThat(result.dml).isEqualTo("DML 56")
        assertThat(result.seaFront).isEqualTo("NAMO")
    }

    @Test
    fun `execute Should return the Alert unchanged When the reporting is an Alert`() {
        // Given
        val alert = anAlert()

        // When
        val result = useCase().execute(alert)

        // Then
        assertThat(result).isSameAs(alert)
    }

    @Test
    fun `execute Should resolve seaFront from coordinates When no vessel id is given`() {
        // Given
        given(facadeAreasRepository.findByIncluding(any())).willReturn(listOf(namoFacadeArea))

        // When
        val result =
            useCase().execute(
                anInfractionSuspicion(vesselId = null, latitude = 47.5, longitude = -2.5),
            )

        // Then
        assertThat(result.seaFront).isEqualTo("NAMO")
        assertThat(result.dml).isNull()
    }

    @Test
    fun `execute Should not throw an exception When no vessel id and no coordinates are given`() {
        // When
        val throwable =
            catchThrowable {
                useCase().execute(anInfractionSuspicion(vesselId = null))
            }

        // Then
        assertThat(throwable).isNull()
    }

    @Test
    fun `execute Should resolve seaFront from coordinates When the vessel is not found`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(null)
        given(facadeAreasRepository.findByIncluding(any())).willReturn(listOf(namoFacadeArea))

        // When
        val result =
            useCase().execute(
                anInfractionSuspicion(vesselId = 123, latitude = 47.5, longitude = -2.5),
            )

        // Then
        assertThat(result.seaFront).isEqualTo("NAMO")
        assertThat(result.dml).isNull()
    }

    @Test
    fun `execute Should resolve seaFront from coordinates When the district is not found`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 123, districtCode = "LO", flagState = CountryCode.FR, hasLogbookEsacapt = false),
        )
        given(districtRepository.find(eq("LO"))).willThrow(CodeNotFoundException("district not found"))
        given(facadeAreasRepository.findByIncluding(any())).willReturn(listOf(namoFacadeArea))

        // When
        val result =
            useCase().execute(
                anInfractionSuspicion(vesselId = 123, latitude = 47.5, longitude = -2.5),
            )

        // Then
        assertThat(result.seaFront).isEqualTo("NAMO")
        assertThat(result.dml).isNull()
    }

    @Test
    fun `execute Should not throw an exception When the vessel has no district code and no coordinates are given`() {
        // Given
        given(vesselRepository.findVesselById(eq(123))).willReturn(
            Vessel(id = 123, districtCode = null, flagState = CountryCode.FR, hasLogbookEsacapt = false),
        )

        // When
        val throwable =
            catchThrowable {
                useCase().execute(anInfractionSuspicion(vesselId = 123))
            }

        // Then
        assertThat(throwable).isNull()
    }

    private fun useCase() = GetReportingWithDMLAndSeaFront(vesselRepository, districtRepository, facadeAreasRepository)

    private fun anInfractionSuspicion(
        vesselId: Int? = null,
        latitude: Double? = null,
        longitude: Double? = null,
    ) = Reporting.InfractionSuspicion(
        id = 1,
        vesselId = vesselId,
        vesselName = "BIDUBULE",
        cfr = "FR224226850",
        externalMarker = "1236514",
        ircs = "IRCS",
        vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        flagState = CountryCode.FR,
        creationDate = ZonedDateTime.now(),
        reportingDate = ZonedDateTime.now(),
        lastUpdateDate = ZonedDateTime.now(),
        isArchived = false,
        isDeleted = false,
        createdBy = "test@example.gouv.fr",
        reportingSource = ReportingSource.OPS,
        natinfCode = 1235,
        title = "Chalut en boeuf illégal",
        threat = "Obligations déclaratives",
        threatCharacterization = "DEP",
        latitude = latitude,
        longitude = longitude,
    )

    private fun anObservation(vesselId: Int? = null) =
        Reporting.Observation(
            id = 1,
            vesselId = vesselId,
            vesselName = "BIDUBULE",
            cfr = "FR224226850",
            externalMarker = "1236514",
            ircs = "IRCS",
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            flagState = CountryCode.FR,
            creationDate = ZonedDateTime.now(),
            reportingDate = ZonedDateTime.now(),
            lastUpdateDate = ZonedDateTime.now(),
            isArchived = false,
            isDeleted = false,
            createdBy = "test@example.gouv.fr",
            reportingSource = ReportingSource.OPS,
            title = "Observation test",
        )

    private fun anAlert() =
        Reporting.Alert(
            id = 1,
            vesselId = 123,
            flagState = CountryCode.FR,
            creationDate = ZonedDateTime.now(),
            isArchived = false,
            isDeleted = false,
            createdBy = "test@example.gouv.fr",
            alertType = AlertType.MISSING_DEP_ALERT,
            natinfCode = 7059,
            threat = "Obligations déclaratives",
            threatCharacterization = "DEP",
            name = "MISSING_DEP_ALERT",
        )
}
