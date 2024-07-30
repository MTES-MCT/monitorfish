package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetNumberToVerify(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(): PriorNotificationStats {
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val automaticPriorNotifications = logbookReportRepository.findAllPriorNotificationsToVerify()
        val manualPriorNotifications = manualPriorNotificationRepository.findAllToVerify()
        val incompletePriorNotifications = automaticPriorNotifications + manualPriorNotifications

        val undeletedPriorNotifications = incompletePriorNotifications
            .filter { !it.logbookMessageTyped.logbookMessage.isDeleted }

        val priorNotifications = undeletedPriorNotifications
            .map { priorNotification ->
                priorNotification.enrich(allPorts, allRiskFactors, allVessels, priorNotification.isManuallyCreated)

                priorNotification
            }

        return PriorNotificationStats(
            perSeafrontGroupCount = SeafrontGroup.entries.associateWith { seafrontGroupEntry ->
                priorNotifications.count { priorNotification ->
                    seafrontGroupEntry.hasSeafront(priorNotification.seafront)
                }
            },
        )
    }
}
