package fr.gouv.cnsp.monitorfish.domain.entities.ers

import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import java.time.ZonedDateTime

class ERSMessage(
        val ersId: String,
        val operationNumber: String,
        val tripNumber: Int,
        val ersIdToDeleteOrCorrect: String? = null,
        val operationType: ERSOperationType,
        val operationDateTime: ZonedDateTime? = null,
        val internalReferenceNumber: String? = null,
        val externalReferenceNumber: String? = null,
        val ircs: String? = null,
        val vesselName: String? = null,
        val flagState: String? = null,
        val imo: String? = null,
        val messageType: String,
        val parsedIntegrationDateTime: ZonedDateTime? = null,
        val message: ERSMessageValue? = null,
        var rawMessage: String? = null)
