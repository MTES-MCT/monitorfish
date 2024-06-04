package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import java.time.ZonedDateTime

@UseCase
class CreateOrUpdatePriorNotification(
    private val logbookReportRepository: LogbookReportRepository,
    private val priorNotificationRepository: PriorNotificationRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        reportId: String?,
        logbookMessage: PNO,
        tripGears: List<LogbookTripGear>,
        vesselId: Int,
    ): PriorNotification {
        val currentLogbookMessage = reportId?.let {
            logbookReportRepository.findPriorNotificationByReportId(reportId)
        }
        val id = currentLogbookMessage?.let { currentLogbookMessage.logbookMessageTyped.logbookMessage.id }
        // TODO To calculate.
        val tripSegments = emptyList<LogbookTripSegment>()
        val vessel = vesselRepository.findVesselById(vesselId)

        val pnoLogbookMessage = LogbookMessage(
            id = id,
            reportId = reportId,
            operationNumber = null,
            tripNumber = null,
            referencedReportId = null,
            operationDateTime = ZonedDateTime.now(),
            internalReferenceNumber = vessel?.internalReferenceNumber,
            externalReferenceNumber = vessel?.externalReferenceNumber,
            ircs = vessel?.ircs,
            vesselName = vessel?.vesselName,
            flagState = vessel?.flagState.toString(),
            imo = vessel?.imo,
            reportDateTime = null,
            integrationDateTime = ZonedDateTime.now(),
            analyzedByRules = emptyList(),
            rawMessage = null,
            transmissionFormat = null,
            software = null,
            acknowledgment = null,
            createdAt = ZonedDateTime.now(),
            // TODO Check if it's `true` when it's updated (normally it should always be `false`).
            isCorrectedByNewerMessage = false,
            isDeleted = false,
            isEnriched = false,
            isManuallyCreated = true,
            isSentByFailoverSoftware = false,
            message = logbookMessage,
            messageType = "PNO",
            operationType = LogbookOperationType.DAT,
            tripGears = tripGears,
            tripSegments = tripSegments,
            updatedAt = ZonedDateTime.now(),
        )
        val logbookMessageTyped = LogbookMessageTyped(pnoLogbookMessage, PNO::class.java)

        val createdOrUpdatedPriorNotification = priorNotificationRepository.save(logbookMessageTyped)

        return createdOrUpdatedPriorNotification
    }
}
