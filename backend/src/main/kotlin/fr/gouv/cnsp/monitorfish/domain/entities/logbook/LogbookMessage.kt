package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.LogbookMessageValue
import java.time.ZonedDateTime

data class LogbookMessage(
    val id: Long,
    val reportId: String? = null,
    val operationNumber: String,
    val tripNumber: String? = null,
    val referencedReportId: String? = null,
    var isCorrected: Boolean? = false,
    val isEnriched: Boolean,
    val operationType: LogbookOperationType,
    val operationDateTime: ZonedDateTime,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselName: String? = null,
    val flagState: String? = null,
    val imo: String? = null,
    val messageType: String? = null,
    // Submission date of the report by the vessel
    val reportDateTime: ZonedDateTime? = null,
    // Reception date of the report by the data center
    val integrationDateTime: ZonedDateTime,
    var acknowledge: Acknowledge? = null,
    var deleted: Boolean? = false,
    val message: LogbookMessageValue? = null,
    val analyzedByRules: List<String>,
    var rawMessage: String? = null,
    val transmissionFormat: LogbookTransmissionFormat,
    val software: String? = null,
    var isSentByFailoverSoftware: Boolean = false,
    val tripGears: List<LogbookTripGear>? = listOf(),
    val tripSegments: List<LogbookTripSegment>? = listOf(),
)
