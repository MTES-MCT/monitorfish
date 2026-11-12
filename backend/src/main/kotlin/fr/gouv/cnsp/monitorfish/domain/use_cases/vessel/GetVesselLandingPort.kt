package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository

/**
 * The port of the next landing of a vessel, from its prior notifications
 * (as in `GetActiveVesselsWithoutVesselGroups`, from the same cached prior notifications).
 */
@UseCase
class GetVesselLandingPort(
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
) {
    fun execute(internalReferenceNumber: String?): Port? {
        if (internalReferenceNumber == null) {
            return null
        }

        return (
            logbookReportRepository.findAllAcknowledgedPriorNotificationsForActiveVessels() +
                manualPriorNotificationRepository.findAllForActiveVessels()
        ).firstOrNull { it.vessel?.internalReferenceNumber == internalReferenceNumber }?.port
    }
}
