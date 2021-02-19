package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.infrastructure.api.FrontController
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBERSRepository
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository
import java.lang.IllegalArgumentException
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaERSRepository(private val dbERSRepository: DBERSRepository,
                       private val mapper: ObjectMapper) : ERSRepository {

    private val logger = LoggerFactory.getLogger(FrontController::class.java)

    override fun findLastDepartureDate(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): ZonedDateTime {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findLastDepartureDateByInternalReferenceNumber(internalReferenceNumber)
                        .atZone(UTC)
            }

            if(externalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findLastDepartureDateByExternalReferenceNumber(externalReferenceNumber)
                        .atZone(UTC)
            }

            if(ircs.isNotEmpty()) {
                return dbERSRepository.findLastDepartureDateByIRCS(ircs)
                        .atZone(UTC)
            }

            throw IllegalArgumentException("No CFR, External marker nor IRCS given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSLastDepartureDateFound(getDepartureDateExceptionMessage(internalReferenceNumber, externalReferenceNumber, ircs), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSLastDepartureDateFound(getDepartureDateExceptionMessage(internalReferenceNumber, externalReferenceNumber, ircs), e)
        }
    }

    private fun getDepartureDateExceptionMessage(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String) =
            "No departure date (DEP) found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\"," +
                    "externalReferenceNumber: \"$externalReferenceNumber\", ircs: \"$ircs\")"

    @Cacheable(value = ["ers"])
    override fun findAllMessagesAfterDepartureDate(dateTime: ZonedDateTime,
                                                   internalReferenceNumber: String,
                                                   externalReferenceNumber: String,
                                                   ircs: String): List<ERSMessage> {
        try {
            if(internalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findERSMessagesAfterOperationDateTime(internalReferenceNumber, dateTime.toInstant()).map {
                    it.toERSMessage(mapper)
                }
            }

            throw IllegalArgumentException("No CFR, External marker nor IRCS given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber, externalReferenceNumber, ircs), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber, externalReferenceNumber, ircs), e)
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
        dbERSRepository.updateERSMessagesAsProcessedByRule(ids, ruleType)
    }

    override fun findById(id: Long): ERSMessage {
        return dbERSRepository.findById(id)
                .get().toERSMessage(mapper)
    }

    private fun getCorrectedMessageIfAvailable(pnoMessage: ERSEntity, messages: List<ERSEntity>): Boolean {
        return if (pnoMessage.operationType == ERSOperationType.DAT) {
            !messages.any { it.operationType == ERSOperationType.COR && it.referencedErsId == pnoMessage.ersId }
        } else {
            true
        }
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String) =
            "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\"," +
                    "externalReferenceNumber: \"$externalReferenceNumber\", ircs: \"$ircs\")"
}
