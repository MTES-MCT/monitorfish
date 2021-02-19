package fr.gouv.cnsp.monitorfish.domain.entities.ers

import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import java.time.ZonedDateTime

class ERSMessage(
        val id: Long,
        val ersId: String? = null,
        val operationNumber: String,
        val tripNumber: Int? = null,
        val referencedErsId: String? = null,
        var isCorrected: Boolean? = false,
        val operationType: ERSOperationType,
        val operationDateTime: ZonedDateTime? = null,
        val internalReferenceNumber: String? = null,
        val externalReferenceNumber: String? = null,
        val ircs: String? = null,
        val vesselName: String? = null,
        val flagState: String? = null,
        val imo: String? = null,
        val messageType: String? = null,
        val parsedIntegrationDateTime: ZonedDateTime? = null,
        var acknowledge: Acknowledge? = null,
        val message: ERSMessageValue? = null,
        val analyzedByRules: List<String>,
        var rawMessage: String? = null)
