package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getFixedVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class DeleteFixedVesselGroupVesselUTests {
    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @Test
    fun `execute Should delete a given vessel`() {
        val groupToUpdate = getFixedVesselGroups().first()

        // Given
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        DeleteFixedVesselGroupVessel(vesselGroupRepository).execute(
            userEmail = "dummy@email.gouv.fr",
            groupId = 1,
            vesselIndex = 1
        )

        // Then
        verify(vesselGroupRepository).save(
            getFixedVesselGroups().first().copy(vessels = listOf(VesselIdentity(
                vesselId = null,
                cfr = "FR123456785",
                name = "MY AWESOME VESSEL TWO",
                flagState = CountryCode.FR,
                ircs = null,
                externalIdentification = null,
                vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
            )))
        )
    }

    @Test
    fun `execute Should throw an exception When the vessel index is bad`() {
        val groupToUpdate = getFixedVesselGroups().first()

        // Given
        given(vesselGroupRepository.findById(any())).willReturn(groupToUpdate)

        // When
        val throwable = catchThrowable {
            DeleteFixedVesselGroupVessel(vesselGroupRepository).execute(
                userEmail = "dummy@email.gouv.fr",
                groupId = 1,
                vesselIndex = 2
            )
        }

        // Then
        assertThat(throwable.message).isEqualTo("Incorrect vessel index")
    }
}
