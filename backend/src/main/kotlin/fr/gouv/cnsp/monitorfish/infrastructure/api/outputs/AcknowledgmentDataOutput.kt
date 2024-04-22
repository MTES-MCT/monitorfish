package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment

class AcknowledgmentDataOutput(
    var dateTime: String?,
    var isSuccess: Boolean,
    var rejectionCause: String?,
    var returnStatus: String?,
) {
    companion object {
        fun fromAcknowledgment(acknowledgment: Acknowledgment): AcknowledgmentDataOutput {
            return AcknowledgmentDataOutput(
                dateTime = acknowledgment.dateTime?.toString(),
                isSuccess = acknowledgment.isSuccess ?: false,
                rejectionCause = acknowledgment.rejectionCause,
                returnStatus = acknowledgment.returnStatus,
            )
        }
    }
}
