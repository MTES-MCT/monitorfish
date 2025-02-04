package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

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
    override val operationDateTime: ZonedDateTime?,
    override val activityDateTime: ZonedDateTime?,
    override val reportDateTime: ZonedDateTime?,
    override val integrationDateTime: ZonedDateTime,
    override val internalReferenceNumber: String?,
    override val externalReferenceNumber: String?,
    override val ircs: String?,
    override val vesselName: String?,
    override val flagState: String?,
    override val imo: String?,
    override val acknowledgment: Acknowledgment?,
    override val isCorrectedByNewerMessage: Boolean,
    override val isDeleted: Boolean,
    override val isSentByFailoverSoftware: Boolean,
    override val message: LogbookMessageValue?,
    override val messageType: String?,
    override val operationType: LogbookOperationType,
    val rawMessage: String?,
    val tripGears: List<LogbookMessageGearDataOutput>?,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>?,
) : BaseLogbookMessageDataOutput {
    companion object {
        fun fromLogbookMessage(logbookMessage: LogbookMessage): LogbookMessageDataOutput {
            val tripGears =
                logbookMessage.tripGears?.mapNotNull {
                    LogbookMessageGearDataOutput.fromGear(it)
                }
            val tripSegments =
                logbookMessage.tripSegments?.map {
                    LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it)
                }

            return LogbookMessageDataOutput(
                internalReferenceNumber = logbookMessage.internalReferenceNumber,
                referencedReportId = logbookMessage.referencedReportId,
                externalReferenceNumber = logbookMessage.externalReferenceNumber,
                ircs = logbookMessage.ircs,
                operationDateTime = logbookMessage.operationDateTime,
                activityDateTime = logbookMessage.activityDateTime,
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
