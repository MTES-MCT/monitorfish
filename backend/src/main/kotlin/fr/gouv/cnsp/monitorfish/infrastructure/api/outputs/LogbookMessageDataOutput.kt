package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import java.time.ZonedDateTime

data class LogbookMessageDataOutput(
    val reportId: String?,
    val operationNumber: String?,
    val tripNumber: String?,
    val referencedReportId: String?,
    val operationDateTime: ZonedDateTime?,
    val reportDateTime: ZonedDateTime?,
    val integrationDateTime: ZonedDateTime?,
    val internalReferenceNumber: String?,
    val externalReferenceNumber: String?,
    val ircs: String?,
    val vesselName: String?,
    val flagState: String?,
    val imo: String?,
    val rawMessage: String?,

    val acknowledgment: Acknowledgment?,
    val isCorrectedByNewerMessage: Boolean,
    val isDeleted: Boolean,
    val isSentByFailoverSoftware: Boolean,
    val message: LogbookMessageValue?,
    val messageType: String?,
    val operationType: LogbookOperationType,
    val tripGears: List<LogbookMessageGearDataOutput>?,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>?,
) {
    companion object {
        fun fromLogbookMessage(logbookMessage: LogbookMessage): LogbookMessageDataOutput {
            val tripGears = logbookMessage.tripGears?.mapNotNull {
                LogbookMessageGearDataOutput.fromGear(it)
            }
            val tripSegments = logbookMessage.tripSegments?.map {
                LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it)
            }

            return LogbookMessageDataOutput(
                internalReferenceNumber = logbookMessage.internalReferenceNumber,
                referencedReportId = logbookMessage.referencedReportId,
                externalReferenceNumber = logbookMessage.externalReferenceNumber,
                ircs = logbookMessage.ircs,
                operationDateTime = logbookMessage.operationDateTime,
                reportDateTime = logbookMessage.reportDateTime,
                integrationDateTime = logbookMessage.integrationDateTime,
                vesselName = logbookMessage.vesselName,
                reportId = logbookMessage.reportId,
                operationNumber = logbookMessage.operationNumber,
                tripNumber = logbookMessage.tripNumber,
                flagState = logbookMessage.flagState,
                imo = logbookMessage.imo,
                rawMessage = logbookMessage.rawMessage,

                acknowledgment = logbookMessage.acknowledgment,
                isCorrectedByNewerMessage = logbookMessage.isCorrectedByNewerMessage,
                isDeleted = logbookMessage.isDeleted,
                isSentByFailoverSoftware = logbookMessage.isSentByFailoverSoftware,
                message = logbookMessage.message,
                messageType = logbookMessage.messageType,
                operationType = logbookMessage.operationType,
                tripGears = tripGears,
                tripSegments = tripSegments,
            )
        }
    }
}
