package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getFixedVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetAllVesselGroupsWithVesselsUTests {
    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `execute get all fixed groups with vessels from last positions`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(lastPositionRepository.findActiveVesselWithReferentialData()).willReturn(
            TestUtils.getDummyLastPositions().map {
                EnrichedActiveVessel(
                    lastPosition = it,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(),
                )
            },
        )
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(getFixedVesselGroups())

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(vesselGroupRepository, lastPositionRepository, getAuthorizedUser).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(2)

        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels).hasSize(2)
        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels.first().cfr).isEqualTo("FR123456785")
        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels.last().cfr).isEqualTo("FR00022680")

        assertThat(vesselGroups.first().vessels).hasSize(2)

        val firstVessel = vesselGroups.first().vessels.first()
        assertThat(firstVessel.lastPosition?.internalReferenceNumber).isEqualTo("FR123456785")

        val lastVessel = vesselGroups.first().vessels.last()
        // VesselId is matched from the getDummyLastPositions() stub: FR00022680 -> FR224226850
        assertThat(lastVessel.lastPosition?.internalReferenceNumber).isEqualTo("FR224226850")
    }

    @Test
    fun `execute get all dynamic groups with vessels from last positions`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "620726063ea5a8121c70f16f1163c85319ee11f1495e85f63ea107b169864ba0",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )
        given(lastPositionRepository.findActiveVesselWithReferentialData()).willReturn(
            TestUtils.getDummyLastPositions().map {
                EnrichedActiveVessel(
                    lastPosition = it,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(),
                )
            },
        )
        given(vesselGroupRepository.findAllByUserAndSharing(any(), anyOrNull())).willReturn(getDynamicVesselGroups())

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(vesselGroupRepository, lastPositionRepository, getAuthorizedUser).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(2)
        assertThat(vesselGroups.first().vessels).hasSize(1)

        val firstVessel = vesselGroups.first().vessels.first()
        assertThat(firstVessel.lastPosition?.vesselId).isEqualTo(1)
        assertThat(firstVessel.lastPosition?.internalReferenceNumber).isEqualTo("FR224226850")
        // OTB is matching with the filter
        assertThat(
            firstVessel.lastPosition
                ?.gearOnboard
                ?.first()
                ?.gear,
        ).isEqualTo("OTB")
    }
}
