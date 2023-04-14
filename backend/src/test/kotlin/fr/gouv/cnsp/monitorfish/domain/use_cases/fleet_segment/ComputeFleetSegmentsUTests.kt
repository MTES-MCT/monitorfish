package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.TestUtils.getDummyFleetSegments
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.*

@ExtendWith(SpringExtension::class)
class ComputeFleetSegmentsUTests {

    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @MockBean
    private lateinit var faoAreasRepository: FAOAreasRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    companion object {
        val fixedClock: Clock = Clock.systemUTC()
    }

    @Test
    fun `execute Should return no segment if the gears are missing`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf("27.1", "27.8.c"), listOf(), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).isEmpty()
    }

    @Test
    fun `execute Should return no segment is the species are missing`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf("27.1", "27.8.c"), listOf("OTB","OTT"), listOf())

        // Then
        assertThat(segment).isEmpty()
    }

    @Test
    fun `execute Should return the SWW01 02 03 segment`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf("27.1", "27.8.c"), listOf("OTB","OTT"), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("SWW01/02/03")
    }

    @Test
    fun `execute Should return two segments is SWW`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf("27.1", "27.8.c"), listOf("OTB","OTT", "OTM"), listOf("HKE", "SOL"))

        // Then
        assertThat(segment).hasSize(2)
        assertThat(segment.first().segment).isEqualTo("SWW01/02/03")
        assertThat(segment.last().segment).isEqualTo("SWW04")
    }

    @Test
    fun `execute Should return the segments associated to the AEFAT port`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())
        BDDMockito.given(portRepository.find(eq("AEFAT"))).willReturn(Port("AEFAT", "Al Jazeera Port", faoAreas = listOf("27.7.d", "27.7")))

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf(), listOf("OTB","OTT", "OTM"), listOf("HKE", "SOL"), portLocode = "AEFAT")

        // Then
        assertThat(segment).hasSize(1)
        assertThat(segment.first().segment).isEqualTo("NWW01/02")
    }

    @Test
    fun `execute Should return the segments associated to the given longitude and latitude`() {
        given(fleetSegmentRepository.findAllByYear(ZonedDateTime.now().year)).willReturn(getDummyFleetSegments())
        given(faoAreasRepository.findByIncluding(any())).willReturn(listOf(
            FAOArea("27.8.c"),
            FAOArea("27.8")
        ))

        // When
        val segment = ComputeFleetSegments(fleetSegmentRepository, faoAreasRepository, portRepository, fixedClock)
            .execute(listOf(), listOf("OTB","OTT", "OTM"), listOf("HKE", "SOL"), 53.3543093, -10.8558547)

        // Then
        assertThat(segment).hasSize(2)
        assertThat(segment.first().segment).isEqualTo("SWW01/02/03")
        assertThat(segment.last().segment).isEqualTo("SWW04")
    }
}
