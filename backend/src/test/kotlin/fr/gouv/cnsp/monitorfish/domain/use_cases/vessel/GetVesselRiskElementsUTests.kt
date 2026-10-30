package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.eq
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.InfractionCategory
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.RiskElementMetrics
import fr.gouv.cnsp.monitorfish.domain.entities.risk_element.VesselRiskElement
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRiskElementRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.createCurrentReporting
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetVesselRiskElementsUTests {
    @MockitoBean
    private lateinit var vesselRiskElementRepository: VesselRiskElementRepository

    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var infractionRepository: InfractionRepository

    @MockitoBean
    private lateinit var getAllLegacyControlUnits: GetAllLegacyControlUnits

    private val marginOfToleranceRiskElement =
        VesselRiskElement(
            cfr = "FAK000999999",
            code = "MOT_MR",
            name = "Exceeding the margin of tolerance",
            riskLevel = 4,
            metrics =
                RiskElementMetrics.Trips(
                    totalTrips = 2,
                    compliantTrips = 0,
                    shareOfNonCompliantTrips = 1.0,
                    nonCompliantTrips = emptyList(),
                ),
        )

    private fun fishingInClosedAreaRiskElement(reportingIds: List<Int>) =
        VesselRiskElement(
            cfr = "FAK000999999",
            code = "CLA_CM",
            name = "Fishing in closed area",
            riskLevel = 3,
            metrics =
                RiskElementMetrics.Occurrences(
                    occurrences = reportingIds.size,
                    reportingIds = reportingIds,
                    beaconMalfunctionIds = emptyList(),
                ),
        )

    private fun alert(
        id: Int,
        validationDate: ZonedDateTime,
    ): Reporting =
        createCurrentReporting(
            internalReferenceNumber = "FAK000999999",
            id = id,
            validationDate = validationDate,
            type = ReportingType.ALERT,
            alertType = AlertType.POSITION_ALERT,
        )

    @Test
    fun `execute Should return the last reporting and the other occurrences of a risk element computed from reportings`() {
        // Given
        val now = ZonedDateTime.now()
        given(vesselRiskElementRepository.findAllByCfr("FAK000999999")).willReturn(
            listOf(fishingInClosedAreaRiskElement(reportingIds = listOf(3, 1, 2)), marginOfToleranceRiskElement),
        )
        // The reporting 3 was deleted since the risk elements computation
        given(reportingRepository.findAllByIds(listOf(3, 1, 2))).willReturn(
            listOf(alert(id = 1, validationDate = now.minusDays(10)), alert(id = 2, validationDate = now.minusDays(1))),
        )
        val infraction = Infraction(natinfCode = 7059, infractionCategory = InfractionCategory.FISHING)
        given(infractionRepository.findInfractionByNatinfCode(eq(7059))).willReturn(infraction)

        // When
        val riskElements =
            GetVesselRiskElements(
                vesselRiskElementRepository,
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute("FAK000999999")

        // Then
        assertThat(riskElements).hasSize(2)

        val reportings = riskElements.first().reportings
        assertThat(reportings?.reporting?.id).isEqualTo(2)
        assertThat((reportings?.reporting as Reporting.Alert).infraction).isEqualTo(infraction)
        assertThat(reportings.otherOccurrencesOfSameAlert.map { it.id }).containsExactly(1)

        assertThat(riskElements.last().riskElement).isEqualTo(marginOfToleranceRiskElement)
        assertThat(riskElements.last().reportings).isNull()
    }

    @Test
    fun `execute Should not return reportings When all reportings of a risk element were deleted`() {
        // Given
        given(vesselRiskElementRepository.findAllByCfr("FAK000999999")).willReturn(
            listOf(fishingInClosedAreaRiskElement(reportingIds = listOf(3))),
        )
        given(reportingRepository.findAllByIds(listOf(3))).willReturn(emptyList())

        // When
        val riskElements =
            GetVesselRiskElements(
                vesselRiskElementRepository,
                reportingRepository,
                infractionRepository,
                getAllLegacyControlUnits,
            ).execute("FAK000999999")

        // Then
        assertThat(riskElements).hasSize(1)
        assertThat(riskElements.first().reportings).isNull()
    }
}
