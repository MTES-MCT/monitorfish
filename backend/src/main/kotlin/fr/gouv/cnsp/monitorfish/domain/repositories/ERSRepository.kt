package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.LastDepartureDateAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import java.time.ZonedDateTime
import kotlin.jvm.Throws

interface ERSRepository {
    @Throws(NoERSLastDepartureDateFound::class)
    fun findLastDepartureDateAndTripNumber(internalReferenceNumber: String): LastDepartureDateAndTripNumber
    fun findAllMessagesBetweenDepartureDates(afterDateTime: ZonedDateTime,
                                             beforeDateTime: ZonedDateTime,
                                             internalReferenceNumber: String): List<ERSMessage>
    fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<ERSMessage, ERSMessage?>>
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)
    fun findById(id: Long): ERSMessage
    // For test purpose
    fun deleteAll()
}
