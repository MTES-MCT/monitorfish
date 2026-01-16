package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getCreateOrUpdateFixedVesselGroupCommands
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class AddOrUpdateFixedVesselGroupUTests {
    @MockitoBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockitoBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute Should create a new vessel group when id is null`() {
        val groupToSave = getCreateOrUpdateFixedVesselGroupCommands().first().copy(id = null)

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )
        given(vesselGroupRepository.upsert(any<FixedVesselGroup>())).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )

        // When
        val savedGroup =
            AddOrUpdateFixedVesselGroup(vesselGroupRepository, getAuthorizedUser)
                .execute("dummy@email.gouv.fr", groupToSave)

        // Then
        assertThat(savedGroup).isEqualTo(TestUtils.getFixedVesselGroups().first())
    }

    @Test
    fun `execute Should update new vessel group when user is the owner`() {
        val groupToSave = getCreateOrUpdateFixedVesselGroupCommands().first()

        // Given
        given(vesselGroupRepository.findById(1)).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )
        given(vesselGroupRepository.upsert(any<FixedVesselGroup>())).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )

        // When
        val savedGroup =
            AddOrUpdateFixedVesselGroup(vesselGroupRepository, getAuthorizedUser)
                .execute("dummy@email.gouv.fr", groupToSave)

        // Then
        assertThat(savedGroup).isEqualTo(TestUtils.getFixedVesselGroups().first())
    }

    @Test
    fun `execute Should throw BackendUsageException When user is not the owner and update a dynamic group`() {
        val groupToSave = getCreateOrUpdateFixedVesselGroupCommands().first()

        // Given
        given(vesselGroupRepository.findById(1)).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )
        given(vesselGroupRepository.upsert(any<FixedVesselGroup>())).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )

        // When
        assertThatThrownBy {
            AddOrUpdateFixedVesselGroup(vesselGroupRepository, getAuthorizedUser)
                .execute("other_email!@email.gouv.fr", groupToSave)
        }
            // Then
            .isInstanceOf(BackendUsageException::class.java)
            .hasMessageContaining("Your are not allowed to update this fixed group.")
    }

    @Test
    fun `execute Should throw BackendUsageException When trying to update a dynamic group to a fixed group`() {
        val groupToSave = getCreateOrUpdateFixedVesselGroupCommands().first().copy()

        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "dummy@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )
        given(vesselGroupRepository.findById(1)).willReturn(
            DynamicVesselGroup(
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
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("PEL13"),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlAtSeaPeriod = LastControlPeriod.BEFORE_ONE_YEAR_AGO,
                        lastControlAtQuayPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            ),
        )
        given(vesselGroupRepository.upsert(any<FixedVesselGroup>())).willReturn(
            TestUtils.getFixedVesselGroups().first(),
        )

        // When
        assertThatThrownBy {
            AddOrUpdateFixedVesselGroup(vesselGroupRepository, getAuthorizedUser)
                .execute("dummy@email.gouv.fr", groupToSave)
        }
            // Then
            .isInstanceOf(BackendUsageException::class.java)
            .hasMessageContaining("Could not update a dynamic group to a fixed group.")
    }
}
