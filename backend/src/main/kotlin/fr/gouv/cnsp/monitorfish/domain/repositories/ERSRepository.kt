package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import java.time.ZonedDateTime

interface ERSRepository {
    fun findLastDepartureDate(internalReferenceNumber: String,
                              externalReferenceNumber: String,
                              ircs: String): ZonedDateTime
    fun findAllMessagesAfterDepartureDate(dateTime: ZonedDateTime,
                                          internalReferenceNumber: String,
                                          externalReferenceNumber: String,
                                          ircs: String): List<ERSMessage>
}
