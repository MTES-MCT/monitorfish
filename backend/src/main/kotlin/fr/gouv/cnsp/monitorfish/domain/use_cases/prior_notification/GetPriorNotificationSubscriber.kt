package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

@UseCase
class GetPriorNotificationSubscriber(
    private val controlUnitRepository: ControlUnitRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(id: Int): PriorNotificationSubscriber {
        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val controlUnit = controlUnitRepository.findAll().find { it.id == id }
        if (controlUnit == null) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        val portSubscriptions = pnoPortSubscriptionRepository.findByControlUnitId(id)
        val segmentSubscriptions = pnoSegmentSubscriptionRepository.findByControlUnitId(id)
        val vesselSubscriptions = pnoVesselSubscriptionRepository.findByControlUnitId(id)

        return enrich(
            controlUnit,
            portSubscriptions,
            segmentSubscriptions,
            vesselSubscriptions,
            allFleetSegments,
            allPorts,
            allVessels,
        )
    }

    companion object {
        fun enrich(
            controlUnit: FullControlUnit,
            portSubscriptions: List<PriorNotificationPortSubscription>,
            segmentSubscriptions: List<PriorNotificationSegmentSubscription>,
            vesselSubscriptions: List<PriorNotificationVesselSubscription>,
            allFleetSegments: List<FleetSegment>,
            allPorts: List<Port>,
            allVessels: List<Vessel>,
        ): PriorNotificationSubscriber {
            portSubscriptions.any { portSubscription -> portSubscription.hasSubscribedToAllPriorNotifications }

            val namedPortSubscriptions =
                portSubscriptions.map { portSubscription ->
                    val port = allPorts.find { it.locode == portSubscription.portLocode }

                    return@map portSubscription.copy(portName = port?.name)
                }
            val namedSegmentSubscriptions =
                segmentSubscriptions.map { fleetSegmentSubscription ->
                    val fleetSegment = allFleetSegments.find { it.segment == fleetSegmentSubscription.segmentCode }

                    return@map fleetSegmentSubscription.copy(segmentName = fleetSegment?.segmentName)
                }
            val namedVesselSubscriptions =
                vesselSubscriptions.map { vesselSubscription ->
                    val vessel = allVessels.find { it.id == vesselSubscription.vesselId }

                    return@map vesselSubscription.copy(vesselName = vessel?.vesselName)
                }

            return PriorNotificationSubscriber(
                controlUnit,
                portSubscriptions = namedPortSubscriptions,
                segmentSubscriptions = namedSegmentSubscriptions,
                vesselSubscriptions = namedVesselSubscriptions,
            )
        }
    }
}
