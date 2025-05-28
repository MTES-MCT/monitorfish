package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class RiskFactorDataOutputUTests {
    @Test
    fun `fromVesselRiskFactor Should return the recent segments When isRecentProfile is true`() {
        // Given
        val riskFactor =
            VesselRiskFactor(
                impactRiskFactor = 2.3,
                probabilityRiskFactor = 2.0,
                detectabilityRiskFactor = 1.9,
                riskFactor = 3.2,
                recentSegments = listOf("NWW002"),
            )

        // When
        val output =
            RiskFactorDataOutput.fromVesselRiskFactor(
                vesselRiskFactor = riskFactor,
                isRecentProfile = true,
            )

        // Then, `segments` is equals to `recentSegments`
        assertThat(output.segments).isEqualTo(listOf("NWW002"))
    }
}
