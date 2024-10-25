package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit

data class PriorNotificationSubscriber(
    val controlUnit: FullControlUnit,
    val fleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscription>,
    val portSubscriptions: List<PriorNotificationPortSubscription>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscription>,
) {
    companion object {
        fun create(
            controlUnit: FullControlUnit,
            fleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscription>,
            portSubscriptions: List<PriorNotificationPortSubscription>,
            vesselSubscriptions: List<PriorNotificationVesselSubscription>,
            allFleetSegments: List<FleetSegment>,
            allPorts: List<Port>,
            allVessels: List<Vessel>,
        ): PriorNotificationSubscriber {
            portSubscriptions.any { portSubscription -> portSubscription.hasSubscribedToAllPriorNotifications }

            val enrichedFleetSegmentSubscriptions =
                fleetSegmentSubscriptions.map { fleetSegmentSubscription ->
                    val fleetSegment = allFleetSegments.find { it.segment == fleetSegmentSubscription.segmentCode }

                    return@map fleetSegmentSubscription.copy(segmentName = fleetSegment?.segmentName)
                }
            val enrichedPortSubscriptions =
                portSubscriptions.map { portSubscription ->
                    val port = allPorts.find { it.locode == portSubscription.portLocode }

                    return@map portSubscription.copy(portName = port?.name)
                }
            val enrichedVesselSubscriptions =
                vesselSubscriptions.map { vesselSubscription ->
                    val vessel = allVessels.find { it.id == vesselSubscription.vesselId }

                    return@map vesselSubscription.copy(
                        vesselCallSign = vessel?.ircs,
                        vesselCfr = vessel?.internalReferenceNumber,
                        vesselExternalMarking = vessel?.externalReferenceNumber,
                        vesselMmsi = vessel?.mmsi,
                        vesselName = vessel?.vesselName,
                    )
                }

            return PriorNotificationSubscriber(
                controlUnit,
                fleetSegmentSubscriptions = enrichedFleetSegmentSubscriptions,
                portSubscriptions = enrichedPortSubscriptions,
                vesselSubscriptions = enrichedVesselSubscriptions,
            )
        }
    }
}
