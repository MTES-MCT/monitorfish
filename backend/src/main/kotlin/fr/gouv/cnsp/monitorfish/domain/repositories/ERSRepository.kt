package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import java.time.ZonedDateTime
import kotlin.jvm.Throws

interface ERSRepository {
    @Throws(NoLogbookFishingTripFound::class)
    fun findLastTripBefore(internalReferenceNumber: String,
                           beforeDateTime: ZonedDateTime): VoyageDatesAndTripNumber
    @Throws(NoLogbookFishingTripFound::class)
    fun findSecondToLastTripBefore(internalReferenceNumber: String,
                                   beforeDateTime: ZonedDateTime): VoyageDatesAndTripNumber
    @Throws(NoLogbookFishingTripFound::class)
    fun findSecondTripAfter(internalReferenceNumber: String, afterDateTime: ZonedDateTime): VoyageDatesAndTripNumber
    fun findAllMessagesByTripNumberBetweenDates(internalReferenceNumber: String,
                                                afterDate: ZonedDateTime,
                                                beforeDate: ZonedDateTime,
                                                tripNumber: Int): List<ERSMessage>
    fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<ERSMessage, ERSMessage?>>
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)
    fun findById(id: Long): ERSMessage
    fun findLastMessageDate(): ZonedDateTime
    // For test purpose
    fun deleteAll()



}
