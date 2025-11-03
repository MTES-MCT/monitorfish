package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

class Acknowledgment(
    var returnStatus: String? = null,
    var rejectionCause: String? = null,
    var isSuccess: Boolean = false,
) : LogbookMessageValue {
    init {
        if (returnStatus != null) {
            isSuccess = returnStatus == "000"
        }
    }
}
