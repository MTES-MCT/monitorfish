package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.AutoPriorNotificationComputedValues
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoPortSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoSegmentSubscriptionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PnoVesselSubscriptionRepository

@UseCase
class ComputeAutoPriorNotification(
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
) {
    fun execute(
        isInVerificationScope: Boolean,
        portLocode: String,
        segmentCodes: List<String>,
        vesselId: Int,
    ): AutoPriorNotificationComputedValues {
        val isPartOfControlUnitSubscriptions = pnoPortSubscriptionRepository.has(portLocode) ||
            pnoVesselSubscriptionRepository.has(vesselId) ||
            pnoSegmentSubscriptionRepository.has(portLocode, segmentCodes)
        val nextState = PriorNotification.getNextState(isInVerificationScope, isPartOfControlUnitSubscriptions)

        return AutoPriorNotificationComputedValues(nextState)
    }
}
