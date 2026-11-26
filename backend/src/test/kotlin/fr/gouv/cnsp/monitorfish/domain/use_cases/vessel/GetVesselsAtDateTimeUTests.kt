package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.DUMMY_VESSEL
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import java.time.Clock
import java.time.ZoneOffset
import java.time.ZonedDateTime

class GetVesselsAtDateTimeUTests {
    private val positionRepository: PositionRepository = mock()
    private val aisPositionRepository: AisPositionRepository = mock()
    private val vesselRepository: VesselRepository = mock()
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository = mock()

    private val replayedAt = ZonedDateTime.parse("2026-11-20T02:00:00Z")
    private val clock = Clock.fixed(replayedAt.plusDays(2).toInstant(), ZoneOffset.UTC)

    private fun getVesselsAtDateTime() =
        GetVesselsAtDateTime(
            positionRepository,
            aisPositionRepository,
            vesselRepository,
            producerOrganizationMembershipRepository,
            clock,
        )

    private fun vmsPosition(
        cfr: String?,
        dateTime: ZonedDateTime,
        ircs: String? = null,
    ) = Position(
        internalReferenceNumber = cfr,
        ircs = ircs,
        positionType = PositionType.VMS,
        latitude = 48.0,
        longitude = -4.0,
        speed = 5.0,
        course = 90.0,
        dateTime = dateTime,
    )

    @Test
    fun `execute Should query the VMS and AIS look-back windows ending at the replayed date`() {
        // Given
        given(positionRepository.findLastPositionOfEachVesselBetween(any(), any())).willReturn(listOf())
        given(aisPositionRepository.findLastPositionOfEachVesselBetween(any(), any())).willReturn(listOf())

        // When
        getVesselsAtDateTime().execute(replayedAt)

        // Then
        verify(positionRepository).findLastPositionOfEachVesselBetween(replayedAt.minusHours(6), replayedAt)
        verify(aisPositionRepository).findLastPositionOfEachVesselBetween(replayedAt.minusHours(1), replayedAt)
    }

    @Test
    fun `execute Should merge the more recent AIS position, keep AIS-only vessels with a CFR and attach the vessel identity`() {
        // Given
        given(positionRepository.findLastPositionOfEachVesselBetween(any(), any())).willReturn(
            listOf(
                vmsPosition("DUMMY_CFR", replayedAt.minusHours(2)),
                vmsPosition("OLDER_AIS_CFR", replayedAt.minusMinutes(5)),
                vmsPosition(null, replayedAt.minusHours(1), ircs = "FOREIGN"),
            ),
        )
        given(aisPositionRepository.findLastPositionOfEachVesselBetween(any(), any())).willReturn(
            listOf(
                AisPosition(
                    mmsi = 1,
                    cfr = "DUMMY_CFR",
                    dateTime = replayedAt.minusMinutes(10),
                    latitude = 47.5,
                    longitude = -3.5,
                ),
                AisPosition(
                    mmsi = 2,
                    cfr = "OLDER_AIS_CFR",
                    dateTime = replayedAt.minusMinutes(30),
                    latitude = 46.0,
                    longitude = -2.0,
                ),
                AisPosition(
                    mmsi = 3,
                    cfr = "AIS_ONLY_CFR",
                    dateTime = replayedAt.minusMinutes(20),
                    latitude = 45.0,
                    longitude = -1.0,
                ),
                AisPosition(mmsi = 4, dateTime = replayedAt.minusMinutes(20), latitude = 44.0, longitude = -1.0),
            ),
        )
        given(vesselRepository.findVesselsByInternalReferenceNumbers(any())).willReturn(listOf(DUMMY_VESSEL))
        given(producerOrganizationMembershipRepository.findAll()).willReturn(
            listOf(
                ProducerOrganizationMembership(
                    internalReferenceNumber = "DUMMY_CFR",
                    joiningDate = "01/01/2020",
                    organizationName = "OP DUMMY",
                ),
            ),
        )

        // When
        val vessels =
            getVesselsAtDateTime().execute(replayedAt)

        // Then
        assertThat(vessels).hasSize(4)

        val mergedVessel = vessels.first { it.position.internalReferenceNumber == "DUMMY_CFR" }
        assertThat(mergedVessel.position.positionType).isEqualTo(PositionType.AIS)
        assertThat(mergedVessel.position.latitude).isEqualTo(47.5)
        assertThat(mergedVessel.vessel).isEqualTo(DUMMY_VESSEL)
        assertThat(mergedVessel.producerOrganization?.organizationName).isEqualTo("OP DUMMY")

        val vmsVessel = vessels.first { it.position.internalReferenceNumber == "OLDER_AIS_CFR" }
        assertThat(vmsVessel.position.positionType).isEqualTo(PositionType.VMS)
        assertThat(vmsVessel.vessel).isNull()
        assertThat(vmsVessel.producerOrganization).isNull()

        assertThat(vessels.first { it.position.internalReferenceNumber == "AIS_ONLY_CFR" }.position.positionType)
            .isEqualTo(PositionType.AIS)
        assertThat(vessels.first { it.position.ircs == "FOREIGN" }.vessel).isNull()
    }
}
