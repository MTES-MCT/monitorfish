package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetAllUserVesselGroupsUTests {
    @MockitoBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockitoBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    private fun authorizedUser(
        service: CnspService? = null,
        isSuperUser: Boolean = false,
    ) = AuthorizedUser(email = "dummy@email.gouv.fr", isSuperUser = isSuperUser, service = service)

    @Test
    fun `execute returns the union of priority groups and user groups for a super user`() {
        given(getAuthorizedUser.execute(any())).willReturn(authorizedUser(isSuperUser = true))
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(getDynamicVesselGroups())

        val groups = GetAllUserVesselGroups(vesselGroupRepository, getAuthorizedUser).execute("dummy@email.gouv.fr")

        assertThat(groups).containsAll(PriorityVesselGroup.PRIORITY_GROUPS)
        assertThat(groups).containsAll(getDynamicVesselGroups())
    }

    @Test
    fun `execute returns only priority groups when a super user has no groups`() {
        given(getAuthorizedUser.execute(any())).willReturn(authorizedUser(isSuperUser = true))
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(emptyList())

        val groups = GetAllUserVesselGroups(vesselGroupRepository, getAuthorizedUser).execute("dummy@email.gouv.fr")

        assertThat(groups).containsExactlyInAnyOrderElementsOf(PriorityVesselGroup.PRIORITY_GROUPS)
    }

    @Test
    fun `execute excludes priority groups for a non-super user`() {
        given(getAuthorizedUser.execute(any())).willReturn(authorizedUser(isSuperUser = false))
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(getDynamicVesselGroups())

        val groups = GetAllUserVesselGroups(vesselGroupRepository, getAuthorizedUser).execute("dummy@email.gouv.fr")

        assertThat(groups).doesNotContainAnyElementsOf(PriorityVesselGroup.PRIORITY_GROUPS)
        assertThat(groups).containsExactlyInAnyOrderElementsOf(getDynamicVesselGroups())
    }

    @Test
    fun `execute passes the user service from GetAuthorizedUser to the repository`() {
        given(getAuthorizedUser.execute(any())).willReturn(authorizedUser(service = CnspService.POLE_OPS_METROPOLE))
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(emptyList())

        GetAllUserVesselGroups(vesselGroupRepository, getAuthorizedUser).execute("dummy@email.gouv.fr")

        verify(
            vesselGroupRepository,
        ).findAllByUserAndSharing(eq("dummy@email.gouv.fr"), eq(CnspService.POLE_OPS_METROPOLE))
    }
}
