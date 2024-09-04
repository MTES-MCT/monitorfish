package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.*
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlObjectivesRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.anyInt
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.Clock
import java.time.ZoneOffset
import java.time.ZonedDateTime
import kotlin.math.pow

@ExtendWith(SpringExtension::class)
class ComputeRiskFactorUTests {
    @MockBean
    private lateinit var riskFactorRepository: RiskFactorRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var controlObjectivesRepository: ControlObjectivesRepository

    val FIXED_CLOCK = Clock.fixed(ZonedDateTime.now().toInstant(), ZoneOffset.UTC)

    @Test
    fun `execute Should return default risk factors When no stored risk factors and control objectives`() {
        // Given
        val portLocode = "LOCODE"
        val fleetSegments = listOf<FleetSegment>()
        val vesselCfr = "CFR"
        val port = Port(locode = portLocode, name = "Port name", facade = "")
        given(portRepository.findByLocode(portLocode)).willReturn(port)
        given(riskFactorRepository.findByInternalReferenceNumber(vesselCfr)).willReturn(null)
        given(controlObjectivesRepository.findAllByYear(anyInt())).willReturn(listOf())

        // When
        val result =
            ComputeRiskFactor(riskFactorRepository, portRepository, controlObjectivesRepository, FIXED_CLOCK).execute(
                portLocode,
                fleetSegments,
                vesselCfr,
            )

        // Then
        assertThat(result).isEqualTo(
            defaultImpactRiskFactor.pow(0.2) *
                defaultProbabilityRiskFactor.pow(0.3) *
                defaultControlRateRiskFactor.pow(0.25) *
                defaultControlPriorityLevel.pow(0.25),
        )
    }

    @Test
    fun `execute Should use highest impact risk factor When multiple fleet segments are given`() {
        // Given
        val portLocode = "LOCODE"
        val fleetSegments =
            listOf(
                FleetSegment(
                    segment = "NWW01",
                    segmentName = "A segment",
                    impactRiskFactor = 0.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
                FleetSegment(
                    segment = "SW85",
                    segmentName = "Another segment",
                    impactRiskFactor = 1.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
            )
        val vesselCfr = "CFR"
        val port = Port(locode = portLocode, name = "Port name", facade = "")
        given(portRepository.findByLocode(portLocode)).willReturn(port)
        given(riskFactorRepository.findByInternalReferenceNumber(vesselCfr)).willReturn(null)
        given(controlObjectivesRepository.findAllByYear(anyInt())).willReturn(listOf())

        // When
        val result =
            ComputeRiskFactor(riskFactorRepository, portRepository, controlObjectivesRepository, FIXED_CLOCK).execute(
                portLocode,
                fleetSegments,
                vesselCfr,
            )

        // Then
        assertThat(result).isEqualTo(
            1.5.pow(0.2) *
                defaultProbabilityRiskFactor.pow(0.3) *
                defaultControlRateRiskFactor.pow(0.25) *
                defaultControlPriorityLevel.pow(0.25),
        )
    }

    @Test
    fun `execute Should use stored risk factors When available`() {
        // Given
        val portLocode = "LOCODE"
        val fleetSegments =
            listOf(
                FleetSegment(
                    segment = "NWW01",
                    segmentName = "A segment",
                    impactRiskFactor = 0.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
            )
        val vesselCfr = "CFR"
        val port = Port(locode = portLocode, name = "Port name", facade = "")
        val storedRiskFactor = VesselRiskFactor(probabilityRiskFactor = 0.6, controlRateRiskFactor = 0.7)
        given(portRepository.findByLocode(portLocode)).willReturn(port)
        given(riskFactorRepository.findByInternalReferenceNumber(vesselCfr)).willReturn(storedRiskFactor)
        given(controlObjectivesRepository.findAllByYear(anyInt())).willReturn(listOf())

        // When
        val result =
            ComputeRiskFactor(riskFactorRepository, portRepository, controlObjectivesRepository, FIXED_CLOCK).execute(
                portLocode,
                fleetSegments,
                vesselCfr,
            )

        // Then
        assertThat(result).isEqualTo(
            0.5.pow(0.2) *
                0.6.pow(0.3) *
                0.7.pow(0.25) *
                defaultControlPriorityLevel.pow(0.25),
        )
    }

    @Test
    fun `execute Should use highest control priority level When control objectives are available`() {
        // Given
        val portLocode = "LOCODE"
        val fleetSegments =
            listOf(
                FleetSegment(
                    segment = "NWW01",
                    segmentName = "A segment",
                    impactRiskFactor = 0.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
            )
        val vesselCfr = "CFR"
        val controlObjectives =
            listOf(
                ControlObjective(
                    facade = "MED",
                    segment = "NWW01",
                    year = ZonedDateTime.now(FIXED_CLOCK).year,
                    controlPriorityLevel = 1.2,
                    targetNumberOfControlsAtSea = 1,
                    targetNumberOfControlsAtPort = 2,
                ),
                ControlObjective(
                    facade = "MEMN",
                    segment = "DF23",
                    year = ZonedDateTime.now(FIXED_CLOCK).year,
                    controlPriorityLevel = 1.5,
                    targetNumberOfControlsAtSea = 1,
                    targetNumberOfControlsAtPort = 2,
                ),
                ControlObjective(
                    facade = "MED",
                    segment = "NWW01",
                    year = 2021,
                    controlPriorityLevel = 1.2,
                    targetNumberOfControlsAtSea = 1,
                    targetNumberOfControlsAtPort = 2,
                ),
            )
        val port = Port(locode = portLocode, name = "Port name", facade = "MED")
        given(portRepository.findByLocode(portLocode)).willReturn(port)
        given(riskFactorRepository.findByInternalReferenceNumber(vesselCfr)).willReturn(null)
        given(controlObjectivesRepository.findAllByYear(anyInt())).willReturn(controlObjectives)

        // When
        val result =
            ComputeRiskFactor(riskFactorRepository, portRepository, controlObjectivesRepository, FIXED_CLOCK).execute(
                portLocode,
                fleetSegments,
                vesselCfr,
            )

        // Then
        assertThat(result).isEqualTo(
            0.5.pow(0.2) *
                defaultProbabilityRiskFactor.pow(0.3) *
                defaultControlRateRiskFactor.pow(0.25) *
                1.2.pow(0.25),
        )
    }

    @Test
    fun `execute Should return correct risk factor When all factors are combined`() {
        // Given
        val portLocode = "LOCODE"
        val fleetSegments =
            listOf(
                FleetSegment(
                    segment = "NWW01",
                    segmentName = "A segment",
                    impactRiskFactor = 0.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
                FleetSegment(
                    segment = "NWW02",
                    segmentName = "Another segment",
                    impactRiskFactor = 2.5,
                    year = 2024,
                    gears = listOf(),
                    faoAreas = listOf(),
                    targetSpecies = listOf(),
                ),
            )
        val vesselCfr = "CFR"
        val storedRiskFactor = VesselRiskFactor(probabilityRiskFactor = 0.6, controlRateRiskFactor = 0.7)
        val controlObjectives =
            listOf(
                ControlObjective(
                    facade = "MED",
                    segment = "NWW01",
                    year = ZonedDateTime.now(FIXED_CLOCK).year,
                    controlPriorityLevel = 1.2,
                    targetNumberOfControlsAtSea = 1,
                    targetNumberOfControlsAtPort = 2,
                ),
                ControlObjective(
                    facade = "MEMN",
                    segment = "DF23",
                    year = ZonedDateTime.now(FIXED_CLOCK).year,
                    controlPriorityLevel = 1.5,
                    targetNumberOfControlsAtSea = 1,
                    targetNumberOfControlsAtPort = 2,
                ),
            )
        val port = Port(locode = portLocode, name = "Port name", facade = "MED")
        given(portRepository.findByLocode(portLocode)).willReturn(port)
        given(riskFactorRepository.findByInternalReferenceNumber(vesselCfr)).willReturn(storedRiskFactor)
        given(controlObjectivesRepository.findAllByYear(anyInt())).willReturn(controlObjectives)

        // When
        val result =
            ComputeRiskFactor(riskFactorRepository, portRepository, controlObjectivesRepository, FIXED_CLOCK).execute(
                portLocode,
                fleetSegments,
                vesselCfr,
            )

        // Then
        assertThat(result).isEqualTo(
            2.5.pow(0.2) *
                0.6.pow(0.3) *
                0.7.pow(0.25) *
                1.2.pow(0.25),
        )
    }
}
