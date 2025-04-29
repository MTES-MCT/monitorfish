package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
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

    @Test
    fun `execute get all fixed groups with vessels from last positions`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            TestUtils.getDummyLastPositions(),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(getFixedVesselGroups())

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(vesselGroupRepository, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(2)

        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels).hasSize(2)
        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels.first().cfr).isEqualTo("FR123456785")
        assertThat((vesselGroups.first().group as FixedVesselGroup).vessels.last().cfr).isEqualTo("FR00022680")

        assertThat(vesselGroups.first().vessels).hasSize(2)

        val firstVessel = vesselGroups.first().vessels.first()
        assertThat(firstVessel.id).isEqualTo(0)
        assertThat(firstVessel.internalReferenceNumber).isEqualTo("FR123456785")

        val lastVessel = vesselGroups.first().vessels.last()
        assertThat(lastVessel.id).isEqualTo(1)
        // VesselId is matched from the last positions table: FR00022680 -> FR224226850
        assertThat(lastVessel.internalReferenceNumber).isEqualTo("FR224226850")
    }

    @Test
    fun `execute get all dynamic groups with vessels from last positions`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            TestUtils.getDummyLastPositions(),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(getDynamicVesselGroups())

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(vesselGroupRepository, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(2)
        assertThat(vesselGroups.first().vessels).hasSize(1)

        val firstVessel = vesselGroups.first().vessels.first()
        assertThat(firstVessel.vesselId).isEqualTo(1)
        assertThat(firstVessel.internalReferenceNumber).isEqualTo("FR224226850")
        // OTB is matching with the filter
        assertThat(firstVessel.gearOnboard?.first()?.gear).isEqualTo("OTB")
    }
}
