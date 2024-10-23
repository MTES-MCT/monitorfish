package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

@UseCase
class GetPriorNotificationSubscriber(
    private val controlUnitRepository: LegacyControlUnitRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
) {
    fun execute(id: Int): PriorNotificationSubscriber {
        val controlUnit = controlUnitRepository.findAll().find { it.id == id }
        if (controlUnit == null) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        val portSubscriptions = pnoPortSubscriptionRepository.findByControlUnitId(id)
        val segmentSubscriptions = pnoSegmentSubscriptionRepository.findByControlUnitId(id)
        val vesselSubscriptions = pnoVesselSubscriptionRepository.findByControlUnitId(id)

        return PriorNotificationSubscriber(
            controlUnit = controlUnit,
            portSubscriptions = portSubscriptions,
            segmentSubscriptions = segmentSubscriptions,
            vesselSubscriptions = vesselSubscriptions,
        )
    }
}
