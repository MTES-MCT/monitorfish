package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import java.time.ZonedDateTime

class Acknowledge : LogbookMessageValue {
    var isSuccess: Boolean? = null
    var returnStatus: String? = null
    var rejectionCause: String? = null
    var dateTime: ZonedDateTime? = null
}
