package fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages

import java.time.ZonedDateTime

class Acknowledgment(
    /** Not in database, only created on the fly. */
    var isSuccess: Boolean? = null,
    var returnStatus: String? = null,
    var rejectionCause: String? = null,
    /** Not in database, only created on the fly. */
    var dateTime: ZonedDateTime? = null,
) : LogbookMessageValue
