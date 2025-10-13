package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getFixedVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class DeleteFixedVesselGroupVesselUTests {
    @MockitoBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockitoBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute Should delete a given vessel When the user is the group creator`() {
        val groupToUpdate = getFixedVesselGroups().first()

        //
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        DeleteFixedVesselGroupVessel(vesselGroupRepository, getAuthorizedUser).execute(
            userEmail = "dummy@email.gouv.fr",
            groupId = 1,
            vesselIndex = 1,
        )

        // Then
        verify(vesselGroupRepository).upsert(
            getFixedVesselGroups().first().copy(
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "FR123456785",
                            name = "MY AWESOME VESSEL TWO",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                    ),
            ),
        )
    }

    @Test
    fun `execute Should delete a given vessel When the user is in the same group`() {
        val groupToUpdate =
            getFixedVesselGroups()
                .first()
                .copy(sharing = Sharing.SHARED, sharedTo = listOf(CnspService.POLE_OPS_METROPOLE))

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        DeleteFixedVesselGroupVessel(vesselGroupRepository, getAuthorizedUser).execute(
            userEmail = "another@email.gouv.fr",
            groupId = 1,
            vesselIndex = 1,
        )

        // Then
        verify(vesselGroupRepository).upsert(
            groupToUpdate.copy(
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "FR123456785",
                            name = "MY AWESOME VESSEL TWO",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                    ),
            ),
        )
    }

    @Test
    fun `execute Should throw an exception When the vessel index is bad`() {
        val groupToUpdate = getFixedVesselGroups().first()

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = CnspService.POLE_OPS_METROPOLE,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        val throwable =
            catchThrowable {
                DeleteFixedVesselGroupVessel(vesselGroupRepository, getAuthorizedUser).execute(
                    userEmail = "dummy@email.gouv.fr",
                    groupId = 1,
                    vesselIndex = 2,
                )
            }

        // Then
        assertThat(throwable.message).isEqualTo("Incorrect vessel index")
    }

    @Test
    fun `execute Should throw an exception When the user is not allowed to delete the group`() {
        val groupToUpdate =
            getFixedVesselGroups().first().copy(
                sharing = Sharing.SHARED,
                sharedTo = listOf(CnspService.POLE_OPS_METROPOLE),
            )

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "another@email.gouv.fr",
                isSuperUser = true,
                service = CnspService.POLE_SIP,
            ),
        )
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        val throwable =
            catchThrowable {
                DeleteFixedVesselGroupVessel(vesselGroupRepository, getAuthorizedUser).execute(
                    userEmail = "NOT_ALLOWED@email.gouv.fr",
                    groupId = 1,
                    vesselIndex = 2,
                )
            }

        // Then
        assertThat(throwable.message).isEqualTo("Your are not allowed to update this fixed group.")
    }
}
