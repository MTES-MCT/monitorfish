package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlUnitRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoSegmentSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

@UseCase
class UpdatePriorNotificationSubscriber(
    private val controlUnitRepository: ControlUnitRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        controlUnitId: Int,
        portSubscriptions: List<PriorNotificationPortSubscription>,
        segmentSubscriptions: List<PriorNotificationSegmentSubscription>,
        vesselSubscriptions: List<PriorNotificationVesselSubscription>,
    ): PriorNotificationSubscriber {
        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val controlUnit = controlUnitRepository.findAll().find { it.id == controlUnitId }
        if (controlUnit == null) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        pnoPortSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        pnoSegmentSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        pnoVesselSubscriptionRepository.deleteByControlUnitId(controlUnitId)
        pnoPortSubscriptionRepository.saveAll(portSubscriptions)
        pnoSegmentSubscriptionRepository.saveAll(segmentSubscriptions)
        pnoVesselSubscriptionRepository.saveAll(vesselSubscriptions)

        return PriorNotificationSubscriber.create(
            controlUnit,
            portSubscriptions,
            segmentSubscriptions,
            vesselSubscriptions,
            allFleetSegments,
            allPorts,
            allVessels,
        )
    }
}
