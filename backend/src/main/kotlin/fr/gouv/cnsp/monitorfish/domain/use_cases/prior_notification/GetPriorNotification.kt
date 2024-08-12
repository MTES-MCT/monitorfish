package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import java.time.ZonedDateTime

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
    fun execute(reportId: String, operationDate: ZonedDateTime, isManuallyCreated: Boolean): PriorNotification {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()

        val priorNotification = if (isManuallyCreated) {
            manualPriorNotificationRepository.findByReportId(reportId)
        } else {
            logbookReportRepository.findPriorNotificationByReportId(reportId, operationDate)
        }
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        priorNotification.enrich(allRiskFactors, allPorts, isManuallyCreated)
        priorNotification.enrichLogbookMessage(
            allGears,
            allPorts,
            allSpecies,
            logbookRawMessageRepository,
        )
        priorNotification.enrichReportingCount(reportingRepository)
        val priorNotificationWithVessel = getPriorNotificationWithVessel(priorNotification)

        return priorNotificationWithVessel
    }

    private fun getPriorNotificationWithVessel(
        priorNotification: PriorNotification,
    ): PriorNotification {
        val vessel = when (priorNotification.isManuallyCreated) {
            true -> if (priorNotification.logbookMessageAndValue.logbookMessage.vesselId != null) {
                vesselRepository.findVesselById(priorNotification.logbookMessageAndValue.logbookMessage.vesselId!!)
            } else {
                null
            }
            false -> if (priorNotification.logbookMessageAndValue.logbookMessage.internalReferenceNumber != null) {
                vesselRepository.findFirstByInternalReferenceNumber(
                    priorNotification.logbookMessageAndValue.logbookMessage.internalReferenceNumber!!,
                )
            } else {
                null
            }
        } ?: UNKNOWN_VESSEL

        return priorNotification.copy(vessel = vessel)
    }
}
