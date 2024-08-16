package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.Utils
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaLogbookReportRepository(
    private val dbLogbookReportRepository: DBLogbookReportRepository,
    private val objectMapper: ObjectMapper,
) : LogbookReportRepository {
    override fun findAllAcknowledgedPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification> {
        // Acknowledged "DAT", "COR" and "DEL" operations
        val logbookReportsWithDatCorAndDel =
            dbLogbookReportRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
                flagStates = filter.flagStates ?: emptyList(),
                hasOneOrMoreReportings = filter.hasOneOrMoreReportings,
                isLessThanTwelveMetersVessel = filter.isLessThanTwelveMetersVessel,
                lastControlledAfter = filter.lastControlledAfter,
                lastControlledBefore = filter.lastControlledBefore,
                portLocodes = filter.portLocodes ?: emptyList(),
                priorNotificationTypesAsSqlArrayString = toSqlArrayString(filter.priorNotificationTypes),
                searchQuery = filter.searchQuery,
                specyCodesAsSqlArrayString = toSqlArrayString(filter.specyCodes),
                tripGearCodesAsSqlArrayString = toSqlArrayString(filter.tripGearCodes),
                tripSegmentCodesAsSqlArrayString = toSqlArrayString(filter.tripSegmentCodes),
                willArriveAfter = filter.willArriveAfter,
                willArriveBefore = filter.willArriveBefore,
            )

        val referencedReportIds = logbookReportsWithDatCorAndDel
            .filter { it.referencedReportId != null }
            .map { it.referencedReportId }
            .toSet()

        return logbookReportsWithDatCorAndDel
            .filter { report ->
                // Exclude reports that are referenced by other reports or have a DEL operation type
                report.operationType != LogbookOperationType.DEL && report.reportId !in referencedReportIds
            }
            .map { report ->
                val pno = PriorNotification.fromLogbookMessage(report.toLogbookMessage(objectMapper))
                // All messages returned from the SQL query are acknowledged
                pno.markAsAcknowledged()

                return@map pno
            }
    }

    @Cacheable(value = ["pno_to_verify"])
    override fun findAllPriorNotificationsToVerify(): List<PriorNotification> {
        val filter = PriorNotificationsFilter(
            willArriveAfter = CustomZonedDateTime(ZonedDateTime.now()).toString(),
            willArriveBefore = CustomZonedDateTime(ZonedDateTime.now().plusHours(24)).toString(),
        )

        return findAllAcknowledgedPriorNotifications(filter).filter {
            it.logbookMessageAndValue.value.isInVerificationScope == true &&
                it.logbookMessageAndValue.value.isVerified == false &&
                it.logbookMessageAndValue.value.isInvalidated != true
        }
    }

    /**
     * Return null if the logbook report:
     * - is not found
     * - is deleted by an acknowledged "DEL" operation
     * - is corrected by an acknowledged "COR" operation
     */
    override fun findAcknowledgedPriorNotificationByReportId(
        reportId: String,
        operationDate: ZonedDateTime,
    ): PriorNotification? {
        val logbookReport = dbLogbookReportRepository
            .findAcknowledgedNonDeletedPnoDatAndCorsByReportId(reportId, operationDate.toString()).firstOrNull()

        return logbookReport?.let {
            val pno = PriorNotification.fromLogbookMessage(it.toLogbookMessage(objectMapper))
            pno.markAsAcknowledged()

            return@let pno
        }
    }

    override fun findLastTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbLogbookReportRepository.findTripsBeforeDatetime(
                        internalReferenceNumber,
                        beforeDateTime.toInstant(),
                        PageRequest.of(0, 1),
                    ).first()

                return VoyageDatesAndTripNumber(
                    lastTrip.tripNumber,
                    lastTrip.startDate.atZone(UTC),
                    lastTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["previous_logbook"])
    override fun findTripBeforeTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val previousTripNumber =
                    dbLogbookReportRepository.findPreviousTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val previousTrip =
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
                        internalReferenceNumber,
                        previousTripNumber,
                    )

                return VoyageDatesAndTripNumber(
                    previousTripNumber,
                    previousTrip.startDate.atZone(UTC),
                    previousTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["first_and_last_trip_dates"])
    override fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val nextTrip =
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
                        internalReferenceNumber,
                        tripNumber,
                    )

                return VoyageDatesAndTripNumber(
                    tripNumber,
                    nextTrip.startDate.atZone(UTC),
                    nextTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["next_logbook"])
    override fun findTripAfterTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val nextTripNumber =
                    dbLogbookReportRepository.findNextTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val nextTrip =
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
                        internalReferenceNumber,
                        nextTripNumber,
                    )

                return VoyageDatesAndTripNumber(
                    nextTripNumber,
                    nextTrip.startDate.atZone(UTC),
                    nextTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    private fun getTripNotFoundExceptionMessage(internalReferenceNumber: String) =
        "No trip found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    @Cacheable(value = ["logbook_messages"])
    override fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDate: ZonedDateTime,
        beforeDate: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookMessage> {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                return dbLogbookReportRepository.findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDate.toInstant().toString(),
                    beforeDate.toInstant().toString(),
                    tripNumber,
                ).map {
                    it.toLogbookMessage(objectMapper)
                }
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["logbook_pno_types"])
    override fun findDistinctPriorNotificationTypes(): List<String> {
        return dbLogbookReportRepository.findDistinctPriorNotificationType() ?: emptyList()
    }

    override fun findById(id: Long): LogbookMessage {
        return dbLogbookReportRepository.findById(id).get().toLogbookMessage(objectMapper)
    }

    override fun findLastMessageDate(): ZonedDateTime {
        return dbLogbookReportRepository.findLastOperationDateTime().atZone(UTC)
    }

    override fun findFirstAcknowledgedDateOfTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): ZonedDateTime {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbLogbookReportRepository.findTripsBeforeDatetime(
                        internalReferenceNumber,
                        beforeDateTime.toInstant(),
                        PageRequest.of(0, 1),
                    ).first()

                return dbLogbookReportRepository.findFirstAcknowledgedDateOfTrip(
                    internalReferenceNumber,
                    lastTrip.tripNumber,
                ).atZone(
                    UTC,
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findLastTwoYearsTripNumbers(internalReferenceNumber: String): List<String> {
        return dbLogbookReportRepository.findLastTwoYearsTripNumbers(internalReferenceNumber)
    }

    override fun findLastReportSoftware(internalReferenceNumber: String): String? {
        return dbLogbookReportRepository.findLastReportSoftware(internalReferenceNumber)
    }

    // For test purpose
    @Modifying
    @Transactional
    override fun deleteAll() {
        dbLogbookReportRepository.deleteAll()
    }

    @Modifying
    @Transactional
    override fun save(message: LogbookMessage) {
        dbLogbookReportRepository.save(LogbookReportEntity.fromLogbookMessage(objectMapper, message))
    }

    @Modifying
    @Transactional
    override fun savePriorNotification(logbookMessageAndValue: LogbookMessageAndValue<PNO>): PriorNotification {
        return PriorNotification.fromLogbookMessage(
            dbLogbookReportRepository
                .save(LogbookReportEntity.fromLogbookMessage(objectMapper, logbookMessageAndValue.logbookMessage))
                .toLogbookMessage(objectMapper),
        )
    }

    @Transactional
    @CacheEvict(value = ["pno_to_verify"], allEntries = true)
    override fun updatePriorNotificationState(
        reportId: String,
        operationDate: ZonedDateTime,

        isBeingSent: Boolean,
        isSent: Boolean,
        isVerified: Boolean,
    ) {
        val logbookReport = dbLogbookReportRepository
            .findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            ).firstOrNull()
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        val pnoValue = objectMapper.readValue(logbookReport.message, PNO::class.java)

        val nextPnoValue = pnoValue.apply {
            this.isBeingSent = isBeingSent
            this.isSent = isSent
            this.isVerified = isVerified
        }
        val updatedLogbookReport = logbookReport.copy(message = objectMapper.writeValueAsString(nextPnoValue))

        dbLogbookReportRepository.save(updatedLogbookReport)
    }

    @Transactional
    override fun updatePriorNotificationAuthorTrigramAndNote(
        reportId: String,
        operationDate: ZonedDateTime,

        authorTrigram: String?,
        note: String?,
    ) {
        val logbookReport = dbLogbookReportRepository
            .findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            ).firstOrNull()
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        val pnoValue = objectMapper.readValue(logbookReport.message, PNO::class.java)
        if (
            Utils.areStringsEqual(authorTrigram, pnoValue.authorTrigram) &&
            Utils.areStringsEqual(note, pnoValue.note)
        ) {
            return
        }

        val nextPnoValue = pnoValue.apply {
            this.authorTrigram = authorTrigram
            this.note = note
            /**
             * The PNO states are re-initialized:
             * - the PDF will be re-generated (done in the use case by deleting the old one)
             * - the PNO will require another verification before sending
             */
            this.isBeingSent = false
            this.isSent = false
            this.isVerified = false
        }
        val updatedLogbookReport = logbookReport.copy(message = objectMapper.writeValueAsString(nextPnoValue))

        dbLogbookReportRepository.save(updatedLogbookReport)
    }

    @Transactional
    @CacheEvict(value = ["pno_to_verify"], allEntries = true)
    override fun invalidate(reportId: String, operationDate: ZonedDateTime) {
        val logbookReport = dbLogbookReportRepository
            .findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            ).firstOrNull()
            ?: throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)

        val pnoValue = objectMapper.readValue(logbookReport.message, PNO::class.java)

        val nextPnoValue = pnoValue.apply {
            this.isInvalidated = true
        }

        val updatedLogbookReport = logbookReport.copy(message = objectMapper.writeValueAsString(nextPnoValue))

        dbLogbookReportRepository.save(updatedLogbookReport)
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String) =
        "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"
}
