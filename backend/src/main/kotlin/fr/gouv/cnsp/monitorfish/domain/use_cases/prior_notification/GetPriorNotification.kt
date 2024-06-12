package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetPriorNotification(
    private val gearRepository: GearRepository,
    private val logbookRawMessageRepository: LogbookRawMessageRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(reportId: String): PriorNotification {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val priorNotification = manualPriorNotificationRepository.findByReportId(reportId)
            ?: logbookReportRepository.findPriorNotificationByReportId(reportId)
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        priorNotification.enrich(allPorts, allRiskFactors, allVessels)
        priorNotification.enrichLogbookMessage(
            allGears,
            allPorts,
            allSpecies,
            logbookRawMessageRepository,
        )
        priorNotification.enrichReportingCount(reportingRepository)

        return priorNotification
    }
}
