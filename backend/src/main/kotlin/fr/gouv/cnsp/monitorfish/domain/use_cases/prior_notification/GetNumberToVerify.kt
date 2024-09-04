package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository

@UseCase
class GetNumberToVerify(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val riskFactorRepository: RiskFactorRepository,
) {
    fun execute(): PriorNotificationStats {
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()

        val automaticPriorNotifications = logbookReportRepository.findAllPriorNotificationsToVerify()
        val manualPriorNotifications = manualPriorNotificationRepository.findAllToVerify()
        val incompletePriorNotifications = automaticPriorNotifications + manualPriorNotifications

        val undeletedPriorNotifications =
            incompletePriorNotifications
                .filter { !it.logbookMessageAndValue.logbookMessage.isDeleted }

        val priorNotifications =
            undeletedPriorNotifications
                .map { priorNotification ->
                    priorNotification.enrich(allRiskFactors, allPorts, priorNotification.isManuallyCreated)

                    priorNotification
                }

        return PriorNotificationStats(
            perSeafrontGroupCount =
                SeafrontGroup.entries.associateWith { seafrontGroupEntry ->
                    priorNotifications.count { priorNotification ->
                        seafrontGroupEntry.hasSeafront(priorNotification.seafront)
                    }
                },
        )
    }
}
