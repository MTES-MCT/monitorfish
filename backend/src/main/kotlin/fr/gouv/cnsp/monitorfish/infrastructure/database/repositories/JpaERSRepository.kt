package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBERSRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import javax.transaction.Transactional

@Repository
class JpaERSRepository(private val dbERSRepository: DBERSRepository,
                       private val mapper: ObjectMapper) : ERSRepository {

    private val postgresChunkSize = 5000

    override fun findLastTripBefore(internalReferenceNumber: String, beforeDateTime: ZonedDateTime): VoyageDatesAndTripNumber {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                val lastTrip = dbERSRepository.findTripsBeforeDatetime(
                        internalReferenceNumber, beforeDateTime.toInstant(), PageRequest.of(0, 1)).first()

                return VoyageDatesAndTripNumber(lastTrip.tripNumber, lastTrip.startDate.atZone(UTC), lastTrip.endDate.atZone(UTC))
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findSecondToLastTripBefore(internalReferenceNumber: String, beforeDateTime: ZonedDateTime): VoyageDatesAndTripNumber {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                val lastTwoTrips = dbERSRepository.findTripsBeforeDatetime(
                    internalReferenceNumber, beforeDateTime.toInstant(), PageRequest.of(0, 2))

                val previousTrip = when (lastTwoTrips.size) {
                    2 -> lastTwoTrips.last()
                    else -> throw NoSuchElementException("No previous trip found.")
                }

                return VoyageDatesAndTripNumber(previousTrip.tripNumber,
                                                previousTrip.startDate.atZone(UTC),
                                                previousTrip.endDate.atZone(UTC))
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findSecondTripAfter(internalReferenceNumber: String, afterDateTime: ZonedDateTime): VoyageDatesAndTripNumber {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                val nextTwoTrips = dbERSRepository.findTripsAfterDatetime(
                        internalReferenceNumber, afterDateTime.toInstant(), PageRequest.of(0, 2))

                val nextTrip = when (nextTwoTrips.size) {
                    2 -> nextTwoTrips.last()
                    else -> throw NoSuchElementException("No next trip found.")
                }

                return VoyageDatesAndTripNumber(nextTrip.tripNumber,
                                                nextTrip.startDate.atZone(UTC),
                                                nextTrip.endDate.atZone(UTC))
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    private fun getTripNotFoundExceptionMessage(internalReferenceNumber: String) =
            "No trip found found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    @Cacheable(value = ["ers"])
    override fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDate: ZonedDateTime,
        beforeDate: ZonedDateTime,
        tripNumber: Int): List<ERSMessage> {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDate.toInstant(),
                    beforeDate.toInstant(),
                    tripNumber
                ).map {
                    it.toERSMessage(mapper)
                }
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<ERSMessage, ERSMessage?>> {
        val lanAndPnoMessages = dbERSRepository.findAllLANAndPNONotProcessedByRule(ruleType)

        val lanAndPnoMessagesWithoutCorrectedMessages = lanAndPnoMessages.filter { lanMessage ->
            getCorrectedMessageIfAvailable(lanMessage, lanAndPnoMessages)
        }

        return lanAndPnoMessagesWithoutCorrectedMessages.filter {
            it.internalReferenceNumber != null &&
                    it.tripNumber != null &&
                    it.messageType == ERSMessageTypeMapping.LAN.name
        }.map { lanMessage ->
            val pnoMessage = lanAndPnoMessagesWithoutCorrectedMessages.singleOrNull { message ->
                message.internalReferenceNumber == lanMessage.internalReferenceNumber &&
                        message.tripNumber == lanMessage.tripNumber &&
                        message.messageType == ERSMessageTypeMapping.PNO.name
            }

            Pair(lanMessage.toERSMessage(mapper), pnoMessage?.toERSMessage(mapper))
        }
    }

    override fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String) {
        ids.chunked(postgresChunkSize).forEach {
            dbERSRepository.updateERSMessagesAsProcessedByRule(it, ruleType)
        }
    }

    override fun findById(id: Long): ERSMessage {
        return dbERSRepository.findById(id)
                .get().toERSMessage(mapper)
    }

    @Modifying
    @Transactional
    override fun deleteAll() {
        dbERSRepository.deleteAll()
    }

    override fun findLastMessageDate(): ZonedDateTime {
        return dbERSRepository.findLastOperationDateTime().atZone(UTC)
    }

    private fun getCorrectedMessageIfAvailable(pnoMessage: ERSEntity, messages: List<ERSEntity>): Boolean {
        return if (pnoMessage.operationType == ERSOperationType.DAT) {
            !messages.any { it.operationType == ERSOperationType.COR && it.referencedErsId == pnoMessage.ersId }
        } else {
            true
        }
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String) =
            "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"
}
