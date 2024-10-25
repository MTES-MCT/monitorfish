package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.fakers.FleetSegmentFaker
import fr.gouv.cnsp.monitorfish.fakers.FullControlUnitFaker
import fr.gouv.cnsp.monitorfish.fakers.PortFaker
import fr.gouv.cnsp.monitorfish.fakers.VesselFaker
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetPriorNotificationSubscriberUTests {
    @MockBean
    private lateinit var controlUnitRepository: ControlUnitRepository

    @MockBean
    private lateinit var fleetSegmentRepository: FleetSegmentRepository

    @MockBean
    private lateinit var pnoPortSubscriptionRepository: PnoPortSubscriptionRepository

    @MockBean
    private lateinit var pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository

    @MockBean
    private lateinit var pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository

    @MockBean
    private lateinit var portRepository: PortRepository

    @MockBean
    private lateinit var vesselRepository: VesselRepository

    @Test
    fun `execute should return a PriorNotificationSubscriber when control unit exists`() {
        // Given
        val fakeControlUnitId = 10023
        val fakeControlUnit = FullControlUnitFaker.fakeFullControlUnit(id = fakeControlUnitId)
        given(controlUnitRepository.findAll()).willReturn(listOf(fakeControlUnit))

        val allFakeFleetSegments =
            listOf(
                FleetSegmentFaker.fakeFleetSegment(segment = "SEG001", segmentName = "Segment 1"),
                FleetSegmentFaker.fakeFleetSegment(segment = "SEG002", segmentName = "Segment 2"),
            )
        given(fleetSegmentRepository.findAll()).willReturn(allFakeFleetSegments)

        val allFakePorts =
            listOf(
                PortFaker.fakePort(locode = "FRABC", name = "Port 1"),
                PortFaker.fakePort(locode = "ESXYZ", name = "Port 2"),
            )
        given(portRepository.findAll()).willReturn(allFakePorts)

        val allFakeVessels =
            listOf(
                VesselFaker.fakeVessel(id = 1, vesselName = "Vessel 1"),
                VesselFaker.fakeVessel(id = 2, vesselName = "Vessel 2"),
            )
        given(vesselRepository.findAll()).willReturn(allFakeVessels)

        val fakeFleetSegmentSubscriptions =
            listOf(
                PriorNotificationFleetSegmentSubscription(
                    controlUnitId = fakeControlUnitId,
                    segmentCode = "SEG001",
                    segmentName = null, // Expecting the use case to populate this
                ),
            )
        given(pnoFleetSegmentSubscriptionRepository.findByControlUnitId(fakeControlUnitId))
            .willReturn(fakeFleetSegmentSubscriptions)

        val portSubscriptions =
            listOf(
                PriorNotificationPortSubscription(
                    controlUnitId = fakeControlUnitId,
                    portLocode = "FRABC",
                    portName = null, // Expecting the use case to populate this
                    hasSubscribedToAllPriorNotifications = false,
                ),
            )
        given(pnoPortSubscriptionRepository.findByControlUnitId(fakeControlUnitId))
            .willReturn(portSubscriptions)

        val vesselSubscriptions =
            listOf(
                PriorNotificationVesselSubscription(
                    controlUnitId = fakeControlUnitId,
                    vesselId = 1,
                    // Expecting the use case to populate these
                    vesselCallSign = null,
                    vesselCfr = null,
                    vesselExternalMarking = null,
                    vesselMmsi = null,
                    vesselName = null,
                ),
            )
        given(pnoVesselSubscriptionRepository.findByControlUnitId(fakeControlUnitId))
            .willReturn(vesselSubscriptions)

        // When
        val result =
            GetPriorNotificationSubscriber(
                controlUnitRepository,
                fleetSegmentRepository,
                pnoPortSubscriptionRepository,
                pnoFleetSegmentSubscriptionRepository,
                pnoVesselSubscriptionRepository,
                portRepository,
                vesselRepository,
            ).execute(fakeControlUnitId)

        // Then
        assertThat(result.controlUnit).isEqualTo(fakeControlUnit)
        assertThat(result.fleetSegmentSubscriptions).containsExactly(
            fakeFleetSegmentSubscriptions[0].copy(segmentName = "Segment 1"),
        )
        assertThat(result.portSubscriptions).containsExactly(portSubscriptions[0].copy(portName = "Port 1"))
        assertThat(result.vesselSubscriptions).containsExactly(vesselSubscriptions[0].copy(vesselName = "Vessel 1"))
    }

    @Test
    fun `execute Should throw BackendUsageException when control unit does not exist`() {
        // Given
        val controlUnitId = 99999
        given(controlUnitRepository.findAll()).willReturn(emptyList())

        // When / Then
        val exception =
            assertThrows<BackendUsageException> {
                GetPriorNotificationSubscriber(
                    controlUnitRepository,
                    fleetSegmentRepository,
                    pnoPortSubscriptionRepository,
                    pnoFleetSegmentSubscriptionRepository,
                    pnoVesselSubscriptionRepository,
                    portRepository,
                    vesselRepository,
                ).execute(controlUnitId)
            }
        assertThat(exception.code).isEqualTo(BackendUsageErrorCode.NOT_FOUND)
    }
}
