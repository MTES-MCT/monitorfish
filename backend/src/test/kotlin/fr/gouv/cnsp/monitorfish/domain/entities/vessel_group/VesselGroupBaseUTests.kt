package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class VesselGroupBaseUTests {
    @Test
    fun `hasUserRights should return true if the user match`() {
        // Given
        val group = getDynamicVesselGroups().first()

        // When
        val hasRights = group.hasUserRights("dummy@email.gouv.fr", null)

        // Then
        assertThat(hasRights).isTrue
    }

    @Test
    fun `hasUserRights should return false if the user does not match`() {
        // Given
        val group = getDynamicVesselGroups().first()

        // When
        val hasRights = group.hasUserRights("BAD_EMAIL@email.gouv.fr", null)

        // Then
        assertThat(hasRights).isFalse
    }

    @Test
    fun `hasUserRights should return true if the service match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                sharing = Sharing.SHARED,
                sharedTo = listOf(CnspService.POLE_OPS_METROPOLE),
            )

        // When
        val hasRights = group.hasUserRights("BAD_EMAIL@email.gouv.fr", CnspService.POLE_OPS_METROPOLE)

        // Then
        assertThat(hasRights).isTrue
    }

    @Test
    fun `hasUserRights should return false if the service does not match`() {
        // Given
        val group =
            getDynamicVesselGroups().first().copy(
                sharing = Sharing.SHARED,
                sharedTo = listOf(CnspService.POLE_OPS_METROPOLE),
            )

        // When
        val hasRights = group.hasUserRights("BAD_EMAIL@email.gouv.fr", CnspService.POLE_SIP)

        // Then
        assertThat(hasRights).isFalse
    }
}
