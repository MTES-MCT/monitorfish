package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.interfaces

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import java.time.ZonedDateTime

interface BaseLogbookMessageDataOutput {
    val reportId: String?
    val operationNumber: String?
    val tripNumber: String?
    val referencedReportId: String?
    val operationDateTime: ZonedDateTime?
    val activityDateTime: ZonedDateTime?
    val reportDateTime: ZonedDateTime?
    val integrationDateTime: ZonedDateTime
    val internalReferenceNumber: String?
    val externalReferenceNumber: String?
    val ircs: String?
    val vesselName: String?
    val flagState: String?
    val imo: String?
    val acknowledgment: Acknowledgment?
    val isCorrectedByNewerMessage: Boolean
    val isDeleted: Boolean
    val isSentByFailoverSoftware: Boolean
    val message: LogbookMessageValue?
    val messageType: String?
    val operationType: LogbookOperationType
}
