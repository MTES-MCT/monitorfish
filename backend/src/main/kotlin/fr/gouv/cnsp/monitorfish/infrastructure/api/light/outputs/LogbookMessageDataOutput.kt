package fr.gouv.cnsp.monitorfish.infrastructure.api.light.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import java.time.ZonedDateTime

data class LogbookMessageDataOutput(
    val reportId: String? = null,
    val operationNumber: String?,
    val tripNumber: String? = null,
    val referencedReportId: String? = null,
    var isCorrected: Boolean? = false,
    val operationType: LogbookOperationType,
    val operationDateTime: ZonedDateTime? = null,
    val reportDateTime: ZonedDateTime? = null,
    val integrationDateTime: ZonedDateTime? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselName: String? = null,
    /** ISO Alpha-3 country code. **/
    val flagState: String? = null,
    val imo: String? = null,
    val messageType: String? = null,
    var acknowledgment: Acknowledgment? = null,
    var deleted: Boolean? = false,
    val message: LogbookMessageValue? = null,
    var rawMessage: String? = null,
    val isSentByFailoverSoftware: Boolean,
) {
    companion object {
        fun fromLogbookMessage(logbookMessage: LogbookMessage) = LogbookMessageDataOutput(
            internalReferenceNumber = logbookMessage.internalReferenceNumber,
            referencedReportId = logbookMessage.referencedReportId,
            externalReferenceNumber = logbookMessage.externalReferenceNumber,
            ircs = logbookMessage.ircs,
            isCorrected = logbookMessage.isCorrectedByNewerMessage,
            acknowledgment = logbookMessage.acknowledgment,
            deleted = logbookMessage.isDeleted,
            operationDateTime = logbookMessage.operationDateTime,
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
            rawMessage = null,
            isSentByFailoverSoftware = logbookMessage.isSentByFailoverSoftware,
        )
    }
}
