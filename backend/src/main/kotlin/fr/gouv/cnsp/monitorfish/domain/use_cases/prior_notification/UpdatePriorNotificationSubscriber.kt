package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

@UseCase
class UpdatePriorNotificationSubscriber(
    private val controlUnitRepository: ControlUnitRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        controlUnitId: Int,
        fleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscription>,
        portSubscriptions: List<PriorNotificationPortSubscription>,
        vesselSubscriptions: List<PriorNotificationVesselSubscription>,
    ): PriorNotificationSubscriber {
        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val controlUnit = controlUnitRepository.findAll().find { it.id == controlUnitId }
        if (controlUnit == null) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        pnoFleetSegmentSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        pnoPortSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        pnoVesselSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        val updatedPnoFleetSegmentSubscriptions =
            pnoFleetSegmentSubscriptionRepository.saveAll(fleetSegmentSubscriptions.distinctBy { it.segmentCode })
        val updatedPnoPortSubscriptions =
            pnoPortSubscriptionRepository.saveAll(portSubscriptions.distinctBy { it.portLocode })
        val updatedPnoVesselSubscriptions =
            pnoVesselSubscriptionRepository.saveAll(vesselSubscriptions.distinctBy { it.vesselId })

        return PriorNotificationSubscriber.create(
            controlUnit,
            fleetSegmentSubscriptions = updatedPnoFleetSegmentSubscriptions,
            portSubscriptions = updatedPnoPortSubscriptions,
            vesselSubscriptions = updatedPnoVesselSubscriptions,
            allFleetSegments,
            allPorts,
            allVessels,
        )
    }
}
