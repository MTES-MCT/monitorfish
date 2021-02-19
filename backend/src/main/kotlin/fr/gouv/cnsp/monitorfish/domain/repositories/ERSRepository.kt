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
    fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<ERSMessage, ERSMessage?>>
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)
    fun findById(id: Long): ERSMessage
}
