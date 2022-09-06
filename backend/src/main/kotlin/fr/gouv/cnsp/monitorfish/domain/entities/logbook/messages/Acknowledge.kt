package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

class Acknowledge() : LogbookMessageValue {
  var isSuccess: Boolean? = null
  var returnStatus: String? = null
  var rejectionCause: String? = null
}
