package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

@UseCase
class GetPriorNotificationSubscriber(
    private val controlUnitRepository: ControlUnitRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(id: Int): PriorNotificationSubscriber {
        val controlUnit = controlUnitRepository.findAll().find { it.id == id }
        if (controlUnit == null) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        val fleetSegmentSubscriptions = pnoFleetSegmentSubscriptionRepository.findByControlUnitId(id)
        val portSubscriptions = pnoPortSubscriptionRepository.findByControlUnitId(id)
        val vesselSubscriptions = pnoVesselSubscriptionRepository.findByControlUnitId(id)

        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val vessels = vesselRepository.findVesselsByIds(vesselSubscriptions.map { it.vesselId })

        return PriorNotificationSubscriber.create(
            controlUnit,
            fleetSegmentSubscriptions,
            portSubscriptions,
            vesselSubscriptions,
            allFleetSegments,
            allPorts,
            allVessels = vessels,
        )
    }
}
