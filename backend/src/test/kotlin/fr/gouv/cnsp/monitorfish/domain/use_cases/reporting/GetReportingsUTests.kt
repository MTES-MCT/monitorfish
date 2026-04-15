package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.within
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit

@ExtendWith(SpringExtension::class)
class GetReportingsUTests {
    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    private val now = ZonedDateTime.now()

    private fun execute(
        reportingPeriod: ReportingPeriod = ReportingPeriod.LAST_MONTH,
        reportingType: ReportingType? = null,
        isArchived: Boolean? = null,
        isIUU: Boolean? = null,
        startDate: ZonedDateTime? = null,
        endDate: ZonedDateTime? = null,
    ) = GetReportings(reportingRepository, getAllLegacyControlUnits).execute(
        isArchived = isArchived,
        isIUU = isIUU,
        reportingType = reportingType,
        reportingPeriod = reportingPeriod,
        startDate = startDate,
        endDate = endDate,
    )

    // --- filter / date logic ---

    @Test
    fun `execute Should build filter with correct date range When period is LAST_MONTH`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())
        given(getAllLegacyControlUnits.execute()).willReturn(listOf())
        val expectedAfterCreationDate = ZonedDateTime.now().minusMonths(1)

        // When
        execute(reportingPeriod = ReportingPeriod.LAST_MONTH)

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            val filter = firstValue
            assertThat(filter.isDeleted).isFalse()
            assertThat(filter.hasPosition).isTrue()
            assertThat(filter.afterCreationDate).isCloseTo(expectedAfterCreationDate, within(2, ChronoUnit.SECONDS))
        }
    }

    @Test
    fun `execute Should expand INFRACTION_SUSPICION type to include ALERT`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())
        given(getAllLegacyControlUnits.execute()).willReturn(listOf())

        // When
        execute(reportingType = ReportingType.INFRACTION_SUSPICION)

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            assertThat(firstValue.types).isEqualTo(listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT))
        }
    }

    @Test
    fun `execute Should use provided startDate and endDate When period is CUSTOM`() {
        // Given
        given(reportingRepository.findAll(any())).willReturn(listOf())
        given(getAllLegacyControlUnits.execute()).willReturn(listOf())
        val startDate = ZonedDateTime.parse("2024-01-01T00:00:00Z")
        val endDate = ZonedDateTime.parse("2024-03-31T23:59:59Z")

        // When
        execute(reportingPeriod = ReportingPeriod.CUSTOM, startDate = startDate, endDate = endDate)

        // Then
        argumentCaptor<ReportingFilter>().apply {
            verify(reportingRepository).findAll(capture())

            val filter = firstValue
            assertThat(filter.afterCreationDate).isEqualTo(startDate)
            assertThat(filter.beforeCreationDate).isEqualTo(endDate)
        }
    }

    // --- control unit pairing ---

    @Test
    fun `execute Should pair a UNIT reporting with its resolved control unit`() {
        // Given
        val controlUnit = LegacyControlUnit(42, "DIRM", false, "PAM Themis", listOf())
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRTEST001",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = now,
                reportingDate = now,
                lastUpdateDate = now,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 42,
                authorContact = null,
                title = "Test",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation",
            )
        BDDMockito.given(reportingRepository.findAll(any())).willReturn(listOf(reporting))
        BDDMockito.given(getAllLegacyControlUnits.execute()).willReturn(listOf(controlUnit))

        // When
        val result = execute()

        // Then
        assertThat(result).hasSize(1)
        val (returnedReporting, returnedUnit) = result.first()
        assertThat(returnedReporting).isEqualTo(reporting)
        assertThat(returnedUnit).isEqualTo(controlUnit)
    }

    @Test
    fun `execute Should pair reporting with null When control unit is not found`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRTEST002",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = now,
                reportingDate = now,
                lastUpdateDate = now,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.UNIT,
                controlUnitId = 99,
                authorContact = null,
                title = "Test",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation",
            )
        BDDMockito.given(reportingRepository.findAll(any())).willReturn(listOf(reporting))
        BDDMockito.given(getAllLegacyControlUnits.execute()).willReturn(listOf())

        // When
        val result = execute()

        // Then
        assertThat(result).hasSize(1)
        val (_, returnedUnit) = result.first()
        assertThat(returnedUnit).isNull()
    }

    @Test
    fun `execute Should pair non-UNIT reporting with null control unit`() {
        // Given
        val reporting =
            Reporting.InfractionSuspicion(
                cfr = "FRTEST003",
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                flagState = CountryCode.FR,
                creationDate = now,
                reportingDate = now,
                lastUpdateDate = now,
                isDeleted = false,
                isArchived = false,
                createdBy = "test@example.gouv.fr",
                reportingSource = ReportingSource.OPS,
                title = "Test",
                natinfCode = 2608,
                threat = "Activités INN",
                threatCharacterization = "Pêche sans autorisation",
            )
        val unrelatedUnit = LegacyControlUnit(1, "DIRM", false, "Cross Etel", listOf())
        BDDMockito.given(reportingRepository.findAll(any())).willReturn(listOf(reporting))
        BDDMockito.given(getAllLegacyControlUnits.execute()).willReturn(listOf(unrelatedUnit))

        // When
        val result = execute()

        // Then
        assertThat(result).hasSize(1)
        val (_, returnedUnit) = result.first()
        assertThat(returnedUnit).isNull()
    }
}
