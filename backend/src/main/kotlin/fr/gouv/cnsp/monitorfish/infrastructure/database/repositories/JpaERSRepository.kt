package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.LastDepartureDateAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
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

    override fun findLastDepartureDateAndTripNumber(internalReferenceNumber: String): LastDepartureDateAndTripNumber {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                val lastDepartureDateAndTripNumber = dbERSRepository.findLastDepartureDateByInternalReferenceNumber(
                        internalReferenceNumber, PageRequest.of(0,1)).first()
                return LastDepartureDateAndTripNumber(
                        lastDepartureDateAndTripNumber.lastDepartureDate.atZone(UTC),
                        lastDepartureDateAndTripNumber.tripNumber)
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoERSLastDepartureDateFound(getDepartureDateExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSLastDepartureDateFound(getDepartureDateExceptionMessage(internalReferenceNumber), e)
        }
    }

    private fun getDepartureDateExceptionMessage(internalReferenceNumber: String) =
            "No departure date (DEP) found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    @Cacheable(value = ["ers"])
    override fun findAllMessagesBetweenDepartureDates(afterDateTime: ZonedDateTime,
                                                      beforeDateTime: ZonedDateTime,
                                                      internalReferenceNumber: String): List<ERSMessage> {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findERSMessagesAfterOperationDateTime(
                        internalReferenceNumber,
                        afterDateTime.toInstant(),
                        beforeDateTime.toInstant()).map {
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
