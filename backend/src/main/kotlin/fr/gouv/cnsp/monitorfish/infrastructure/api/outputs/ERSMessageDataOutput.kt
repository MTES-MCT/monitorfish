package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.ERSMessageValue
import java.time.ZonedDateTime

data class ERSMessageDataOutput(
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
        var acknowledge: Acknowledge? = null,
        val message: ERSMessageValue? = null,
        var rawMessage: String? = null) {
    companion object {
        fun fromERSMessage(ersMessage: ERSMessage) = ERSMessageDataOutput(
                internalReferenceNumber = ersMessage.internalReferenceNumber,
                referencedErsId = ersMessage.referencedErsId,
                externalReferenceNumber = ersMessage.externalReferenceNumber,
                ircs = ersMessage.ircs,
                operationDateTime = ersMessage.operationDateTime,
                vesselName = ersMessage.vesselName,
                operationType = ersMessage.operationType,
                ersId = ersMessage.ersId,
                operationNumber = ersMessage.operationNumber,
                tripNumber = ersMessage.tripNumber,
                flagState = ersMessage.flagState,
                imo = ersMessage.imo,
                messageType = ersMessage.messageType,
                message = ersMessage.message
        )
    }
}
