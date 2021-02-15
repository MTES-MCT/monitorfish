package fr.gouv.cnsp.monitorfish.domain.entities.ers.messages

class Acknowledge() : ERSMessageValue {
    var isSuccess: Boolean? = null
    var returnStatus: String? = null
    var rejectionCause: String? = null
}
