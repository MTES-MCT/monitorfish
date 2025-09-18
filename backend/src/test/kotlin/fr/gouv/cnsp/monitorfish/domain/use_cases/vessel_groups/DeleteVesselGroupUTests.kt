package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class DeleteVesselGroupUTests {
    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute Should delete a vessel group When the owner delete it`() {
        val groupToDelete = getDynamicVesselGroups().first()

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToDelete)

        // When
        DeleteVesselGroup(vesselGroupRepository, getAuthorizedUser).execute("dummy@email.gouv.fr", 1)

        // Then
        verify(vesselGroupRepository).findById(eq(1))
    }

    @Test
    fun `execute Should delete a vessel group When a member of the service delete it`() {
        val groupToDelete =
            getDynamicVesselGroups().first().copy(
                sharing = Sharing.SHARED,
                sharedTo =
                    listOf(
                        CnspService.POLE_OPS_METROPOLE,
                    ),
            )

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "a6ad88a1dcff3355c23693eaf12898065873d38e13f41d8841f05ee2c6a19f3a",
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
                isAdministrator = false,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToDelete)

        // When
        DeleteVesselGroup(vesselGroupRepository, getAuthorizedUser).execute("another@email.gouv.fr", 1)

        // Then
        verify(vesselGroupRepository).findById(eq(1))
    }

    @Test
    fun `execute Should throw an exception When no right to delete a vessel group`() {
        val groupToDelete = getDynamicVesselGroups().first()

        // Given
        given(vesselGroupRepository.findById(any())).willReturn(groupToDelete)

        // When
        val throwable =
            catchThrowable {
                DeleteVesselGroup(vesselGroupRepository, getAuthorizedUser).execute("BAD_dummy@email.gouv.fr", 1)
            }

        // Then
        assertThat(throwable).isNotNull()
    }
}
