package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AddOrUpdateDynamicVesselGroupUTests {
    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @Test
    fun `execute Should create a new vessel group when id is null`() {
        val groupToSave = TestUtils.getDynamicVesselGroups().first().copy(id = null)

        // Given
        given(vesselGroupRepository.save(any<DynamicVesselGroup>())).willReturn(
            TestUtils.getDynamicVesselGroups().first(),
        )

        // When
        val savedGroup =
            AddOrUpdateDynamicVesselGroup(vesselGroupRepository)
                .execute("dummy@email.gouv.fr", groupToSave)

        // Then
        assertThat(savedGroup).isEqualTo(TestUtils.getDynamicVesselGroups().first())
    }

    @Test
    fun `execute Should update new vessel group when user is the owner`() {
        val groupToSave = TestUtils.getDynamicVesselGroups().first()

        // Given
        given(vesselGroupRepository.findById(1)).willReturn(
            groupToSave,
        )
        given(vesselGroupRepository.save(any<DynamicVesselGroup>())).willReturn(
            groupToSave,
        )

        // When
        val savedGroup =
            AddOrUpdateDynamicVesselGroup(vesselGroupRepository)
                .execute("dummy@email.gouv.fr", groupToSave)

        // Then
        assertThat(savedGroup).isEqualTo(TestUtils.getDynamicVesselGroups().first())
    }

    @Test
    fun `execute Should throw BackendUsageException When user is not the owner and update a dynamic group`() {
        val groupToSave = TestUtils.getDynamicVesselGroups().first()

        // Given
        given(vesselGroupRepository.findById(1)).willReturn(
            groupToSave,
        )
        given(vesselGroupRepository.save(any<DynamicVesselGroup>())).willReturn(
            groupToSave,
        )

        // When
        assertThatThrownBy {
            AddOrUpdateDynamicVesselGroup(vesselGroupRepository)
                .execute("other_email!@email.gouv.fr", groupToSave)
        }
            // Then
            .isInstanceOf(BackendUsageException::class.java)
            .hasMessageContaining("Your are not allowed to update this dynamic group.")
    }

    @Test
    fun `execute Should throw BackendUsageException When trying to update a fixed group to a dynamic group`() {
        val groupToSave = TestUtils.getDynamicVesselGroups().first().copy()

        // Given
        given(vesselGroupRepository.findById(1)).willReturn(
            FixedVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                vessels = listOf(),
            ),
        )
        given(vesselGroupRepository.save(any<DynamicVesselGroup>())).willReturn(
            groupToSave,
        )

        // When
        assertThatThrownBy {
            AddOrUpdateDynamicVesselGroup(vesselGroupRepository)
                .execute("dummy@email.gouv.fr", groupToSave)
        }
            // Then
            .isInstanceOf(BackendUsageException::class.java)
            .hasMessageContaining("Could not update a fixed group to a dynamic group.")
    }
}
