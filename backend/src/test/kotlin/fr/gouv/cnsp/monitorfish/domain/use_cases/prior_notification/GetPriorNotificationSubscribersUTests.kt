package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationSubscribersFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationSubscribersSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.fakers.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.Sort

@ExtendWith(MockitoExtension::class)
class GetPriorNotificationSubscribersUTests {
    @Mock
    private lateinit var controlUnitRepository: ControlUnitRepository

    @Mock
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @Mock
    private lateinit var pnoPortSubscriptionRepository: PnoPortSubscriptionRepository

    @Mock
    private lateinit var pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository

    @Mock
    private lateinit var pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository

    @Mock
    private lateinit var portRepository: PortRepository

    @Mock
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute should return all prior notification subscribers when no filter is applied`() {
        // Given
        val fakeFullControlUnit1 = FullControlUnitFaker.fakeFullControlUnit(id = 1, name = "Control Unit 1")
        val fakeFullControlUnit2 = FullControlUnitFaker.fakeFullControlUnit(id = 2, name = "Control Unit 2")
        given(controlUnitRepository.findAll()).willReturn(listOf(fakeFullControlUnit1, fakeFullControlUnit2))

        val fakeFleetSegment1 = FleetSegmentFaker.fakeFleetSegment(segment = "SEG001", segmentName = "Segment 1")
        val fakeFleetSegment2 = FleetSegmentFaker.fakeFleetSegment(segment = "SEG002", segmentName = "Segment 2")
        given(fleetSegmentRepository.findAll()).willReturn(listOf(fakeFleetSegment1, fakeFleetSegment2))

        val fakePort1 = PortFaker.fakePort(locode = "FRABC", name = "Port ABC")
        val fakePort2 = PortFaker.fakePort(locode = "ESXYZ", name = "Port XYZ")
        given(portRepository.findAll()).willReturn(listOf(fakePort1, fakePort2))

        val fakeVessel1 = VesselFaker.fakeVessel(id = 1, vesselName = "Vessel 1")
        val fakeVessel2 = VesselFaker.fakeVessel(id = 2, vesselName = "Vessel 2")
        given(vesselRepository.findAll()).willReturn(listOf(fakeVessel1, fakeVessel2))

        val fakeFleetSegmentSubscriptions =
            listOf(
                PriorNotificationFleetSegmentSubscription(
                    controlUnitId = 1,
                    segmentCode = "SEG001",
                    segmentName = null,
                ),
                PriorNotificationFleetSegmentSubscription(
                    controlUnitId = 2,
                    segmentCode = "SEG002",
                    segmentName = null,
                ),
            )

        given(pnoFleetSegmentSubscriptionRepository.findAll()).willReturn(fakeFleetSegmentSubscriptions)

        val fakePortSubscriptions =
            listOf(
                PriorNotificationPortSubscription(
                    controlUnitId = 1,
                    portLocode = "FRABC",
                    portName = null,
                    hasSubscribedToAllPriorNotifications = false,
                ),
                PriorNotificationPortSubscription(
                    controlUnitId = 2,
                    portLocode = "ESXYZ",
                    portName = null,
                    hasSubscribedToAllPriorNotifications = false,
                ),
            )

        given(pnoPortSubscriptionRepository.findAll()).willReturn(fakePortSubscriptions)

        val fakeVesselSubscriptions =
            listOf(
                PriorNotificationVesselSubscription(
                    controlUnitId = 1,
                    vesselId = 1,
                    vesselName = null,
                ),
                PriorNotificationVesselSubscription(
                    controlUnitId = 2,
                    vesselId = 2,
                    vesselName = null,
                ),
            )

        given(pnoVesselSubscriptionRepository.findAll()).willReturn(fakeVesselSubscriptions)

        // When
        val useCase =
            GetPriorNotificationSubscribers(
                controlUnitRepository,
                fleetSegmentRepository,
                pnoPortSubscriptionRepository,
                pnoFleetSegmentSubscriptionRepository,
                pnoVesselSubscriptionRepository,
                portRepository,
                vesselRepository,
            )

        val result =
            useCase.execute(
                filter = PriorNotificationSubscribersFilter(),
                sortColumn = PriorNotificationSubscribersSortColumn.CONTROL_UNIT_NAME,
                sortDirection = Sort.Direction.ASC,
            )

        // Then
        assertThat(result).hasSize(2)

        assertThat(result[0].controlUnit).isEqualTo(fakeFullControlUnit1)
        assertThat(result[0].fleetSegmentSubscriptions).isEqualTo(
            listOf(fakeFleetSegmentSubscriptions[0].copy(segmentName = "Segment 1")),
        )
        assertThat(result[0].portSubscriptions).isEqualTo(
            listOf(fakePortSubscriptions[0].copy(portName = "Port ABC")),
        )
        assertThat(result[0].vesselSubscriptions).isEqualTo(
            listOf(fakeVesselSubscriptions[0].copy(vesselName = "Vessel 1")),
        )

        assertThat(result[1].controlUnit).isEqualTo(fakeFullControlUnit2)
        assertThat(result[1].fleetSegmentSubscriptions).isEqualTo(
            listOf(fakeFleetSegmentSubscriptions[1].copy(segmentName = "Segment 2")),
        )
        assertThat(result[1].portSubscriptions).isEqualTo(
            listOf(fakePortSubscriptions[1].copy(portName = "Port XYZ")),
        )
        assertThat(result[1].vesselSubscriptions).isEqualTo(
            listOf(fakeVesselSubscriptions[1].copy(vesselName = "Vessel 2")),
        )
    }
}
