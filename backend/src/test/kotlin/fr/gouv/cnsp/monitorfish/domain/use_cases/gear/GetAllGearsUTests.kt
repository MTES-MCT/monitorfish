package fr.gouv.cnsp.monitorfish.domain.use_cases.gear

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.gear.GearCodeGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearCodeGroupRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.GearRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.Clock

@ExtendWith(SpringExtension::class)
class GetAllGearsUTests {
    @MockitoBean
    private lateinit var gearRepository: GearRepository

    @MockitoBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @MockitoBean
    private lateinit var gearCodeGroupRepository: GearCodeGroupRepository

    companion object {
        val fixedClock: Clock = Clock.systemUTC()
    }

    @Test
    fun `execute Should return gears augmented with other properties`() {
        // Given
        given(fleetSegmentRepository.findAllSegmentsGearsWithRequiredMesh(any())).willReturn(
            listOf("PTM", "GTN", "PTB", "GNF", "TBB", "TBS", "OTB", "TB", "SDN", "TM", "SSC", "OTM"),
        )
        given(gearRepository.findAll()).willReturn(
            listOf(
                Gear("OTB", "Chaluts de fond à panneaux"),
                Gear("DRB", "Dragues remorquées par bateau"),
            ),
        )
        given(gearCodeGroupRepository.find(eq("OTB"))).willReturn(
            GearCodeGroup(
                code = "OTB",
                groupId = 1,
            ),
        )
        given(gearCodeGroupRepository.find(eq("DRB"))).willThrow(CodeNotFoundException("Code not found"))

        // When
        val gears = GetAllGears(gearRepository, fleetSegmentRepository, gearCodeGroupRepository, fixedClock).execute()

        // Then
        assertThat(gears).hasSize(2)
        assertThat(gears.first().code).isEqualTo("DRB")
        assertThat(gears.first().groupId).isNull()
        assertThat(gears.first().isMeshRequiredForSegment).isFalse()
        assertThat(gears.last().code).isEqualTo("OTB")
        assertThat(gears.last().groupId).isEqualTo(1)
        assertThat(gears.last().isMeshRequiredForSegment).isTrue()
    }
}
