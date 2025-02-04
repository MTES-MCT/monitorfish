package fr.gouv.cnsp.monitorfish.infrastructure.api.light.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.interfaces.BaseLogbookMessageDataOutput
import java.time.ZonedDateTime

data class LogbookMessageDataOutput(
    override val reportId: String?,
    override val operationNumber: String?,
    override val tripNumber: String?,
    override val referencedReportId: String?,
    override val isCorrectedByNewerMessage: Boolean,
    override val operationType: LogbookOperationType,
    override val operationDateTime: ZonedDateTime?,
    override val activityDateTime: ZonedDateTime?,
    override val reportDateTime: ZonedDateTime?,
    override val integrationDateTime: ZonedDateTime?,
    override val internalReferenceNumber: String?,
    override val externalReferenceNumber: String?,
    override val ircs: String?,
    override val vesselName: String?,
    override val flagState: String?,
    override val imo: String?,
    override val messageType: String?,
    override val acknowledgment: Acknowledgment?,
    override val isDeleted: Boolean,
    override val message: LogbookMessageValue?,
    override val isSentByFailoverSoftware: Boolean,
): BaseLogbookMessageDataOutput {
    companion object {
        fun fromLogbookMessage(logbookMessage: LogbookMessage) =
            LogbookMessageDataOutput(
                internalReferenceNumber = logbookMessage.internalReferenceNumber,
                referencedReportId = logbookMessage.referencedReportId,
                externalReferenceNumber = logbookMessage.externalReferenceNumber,
                ircs = logbookMessage.ircs,
                isCorrectedByNewerMessage = logbookMessage.isCorrectedByNewerMessage,
                acknowledgment = logbookMessage.acknowledgment,
                isDeleted = logbookMessage.isDeleted,
                operationDateTime = logbookMessage.operationDateTime,
                activityDateTime = logbookMessage.activityDateTime,
                reportDateTime = logbookMessage.reportDateTime,
                integrationDateTime = logbookMessage.integrationDateTime,
                vesselName = logbookMessage.vesselName,
                operationType = logbookMessage.operationType,
                reportId = logbookMessage.reportId,
                operationNumber = logbookMessage.operationNumber,
                tripNumber = logbookMessage.tripNumber,
                flagState = logbookMessage.flagState,
                imo = logbookMessage.imo,
                messageType = logbookMessage.messageType,
                message = logbookMessage.message,
                isSentByFailoverSoftware = logbookMessage.isSentByFailoverSoftware,
            )
    }
}
