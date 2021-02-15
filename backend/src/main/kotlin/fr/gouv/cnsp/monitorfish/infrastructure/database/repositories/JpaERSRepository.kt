package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.ERSRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBERSRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository
import java.lang.IllegalArgumentException
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaERSRepository(@Autowired
                       private val dbERSRepository: DBERSRepository,
                       @Autowired
                       private val mapper: ObjectMapper) : ERSRepository {

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

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String) =
            "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\"," +
                    "externalReferenceNumber: \"$externalReferenceNumber\", ircs: \"$ircs\")"
}
