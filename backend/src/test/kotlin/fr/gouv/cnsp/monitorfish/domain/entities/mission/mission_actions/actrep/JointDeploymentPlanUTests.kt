package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class JointDeploymentPlanUTests {
    @Test
    fun `isLandControlConcerned Should return true When a targeted specy and fao code are contained in the control`() {
        // Given
        val jdp = JointDeploymentPlan.NORTH_SEA
        val faoCodes = listOf("27.4.b", "27.4.c")
        val species = listOf("HKE", "ANN", "BOR")

        // When
        val isLandControlConcerned = jdp.isLandControlApplicable("FR", species, faoCodes)

        // Then
        assertThat(isLandControlConcerned).isTrue()
    }

    @Test
    fun `isLandControlConcerned Should return false When a targeted specy is not contained in the control`() {
        // Given
        val jdp = JointDeploymentPlan.NORTH_SEA
        val faoCodes = listOf("27.4.b", "27.4.c")
        // The "HKE" specy is missing
        val species = listOf("ANN", "BOR")

        // When
        val isLandControlConcerned = jdp.isLandControlApplicable("FR", species, faoCodes)

        // Then
        assertThat(isLandControlConcerned).isFalse()
    }

    @Test
    fun `isLandControlConcerned Should return false When a targeted fao code is not contained in the control`() {
        // Given
        val jdp = JointDeploymentPlan.NORTH_SEA
        // The "27.4" fao code is missing
        val faoCodes = listOf("27.5.b", "27.5.c")
        val species = listOf("HKE", "ANN", "BOR")

        // When
        val isLandControlConcerned = jdp.isLandControlApplicable("FR", species, faoCodes)

        // Then
        assertThat(isLandControlConcerned).isFalse()
    }

    @Test
    fun `isLandControlConcerned Should return true When a third country vessel has species in the EU quota list`() {
        // Given
        val jdp = JointDeploymentPlan.NORTH_SEA
        val faoCodes = listOf("27.5.b", "27.5.c")
        // ALB is contained in the quotas
        val species = listOf("HKE", "ANN", "BOR", "ALB")

        // When
        val isLandControlConcerned = jdp.isLandControlApplicable("GB", species, faoCodes)

        // Then
        assertThat(isLandControlConcerned).isTrue()
    }

    @Test
    fun `isLandControlConcerned Should return false When a third country vessel has no species in the EU quota list`() {
        // Given
        val jdp = JointDeploymentPlan.NORTH_SEA
        val faoCodes = listOf("27.5.b", "27.5.c")
        val species = listOf("HKE", "ANN", "BOR")

        // When
        val isLandControlConcerned = jdp.isLandControlApplicable("GB", species, faoCodes)

        // Then
        assertThat(isLandControlConcerned).isFalse()
    }
}
