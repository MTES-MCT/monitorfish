package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

data class PriorNotificationSubscriber(
    val controlUnit: FullControlUnit,
    val portSubscriptions: List<PriorNotificationPortSubscription>,
    val segmentSubscriptions: List<PriorNotificationSegmentSubscription>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscription>,
) {
    companion object {
        fun create(
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
