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
import fr.gouv.cnsp.monitorfish.domain.exceptions.*
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(JpaLogbookReportRepository::class.java)

    override fun findAllPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification> {
        val allLogbookReportModels = dbLogbookReportRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
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

        return mapToReferenceWithRelatedModels(allLogbookReportModels)
            .mapNotNull { (referenceLogbookReportModel, relatedLogbookReportModels) ->
                try {
                    referenceLogbookReportModel.toPriorNotification(objectMapper, relatedLogbookReportModels)
                } catch (e: Exception) {
                    logger.warn(
                        "Error while converting logbook report models to prior notifications (reportId = ${referenceLogbookReportModel.reportId}).",
                        e,
                    )

                    null
                }
            }
    }

    @Cacheable(value = ["pno_to_verify"])
    override fun findAllPriorNotificationsToVerify(): List<PriorNotification> {
        val allLogbookReportModels = dbLogbookReportRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
            flagStates = emptyList(),
            hasOneOrMoreReportings = null,
            isLessThanTwelveMetersVessel = null,
            lastControlledAfter = null,
            lastControlledBefore = null,
            portLocodes = emptyList(),
            priorNotificationTypesAsSqlArrayString = null,
            searchQuery = null,
            specyCodesAsSqlArrayString = null,
            tripGearCodesAsSqlArrayString = null,
            tripSegmentCodesAsSqlArrayString = null,
            willArriveAfter = CustomZonedDateTime(ZonedDateTime.now()).toString(),
            willArriveBefore = CustomZonedDateTime(ZonedDateTime.now().plusHours(24)).toString(),
        )

        return mapToReferenceWithRelatedModels(allLogbookReportModels)
            .mapNotNull { (referenceLogbookReportModel, relatedLogbookReportModels) ->
                try {
                    referenceLogbookReportModel.toPriorNotification(objectMapper, relatedLogbookReportModels)
                } catch (e: Exception) {
                    logger.warn(
                        "Error while converting logbook report models to prior notifications (reportId = ${referenceLogbookReportModel.reportId}).",
                        e,
                    )

                    null
                }
            }.filter {
                it.logbookMessageAndValue.value.isInVerificationScope == true &&
                    it.logbookMessageAndValue.value.isVerified == false &&
                    it.logbookMessageAndValue.value.isInvalidated != true
            }
    }

    override fun findPriorNotificationByReportId(reportId: String, operationDate: ZonedDateTime): PriorNotification? {
        val allLogbookReportModels = dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
            reportId,
            operationDate.toString(),
        )
        if (allLogbookReportModels.isEmpty()) {
            return null
        }

        try {
            val (referenceLogbookReportModel, relatedLogbookReportModels) =
                mapToReferenceWithRelatedModels(allLogbookReportModels).first()

            return referenceLogbookReportModel.toPriorNotification(objectMapper, relatedLogbookReportModels)
        } catch (e: Exception) {
            throw EntityConversionException(
                "Error while converting logbook report models to prior notification (reoportId = $reportId).",
                e,
            )
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
        return dbLogbookReportRepository
            .save(LogbookReportEntity.fromLogbookMessage(objectMapper, logbookMessageAndValue.logbookMessage))
            .toPriorNotification(objectMapper, emptyList())
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
        val logbookReportEntities =
            dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            )
        if (logbookReportEntities.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        // We need to update both DAT and related COR operations (which also covers orphan COR cases)
        logbookReportEntities
            .filter { it.operationType in listOf(LogbookOperationType.DAT, LogbookOperationType.COR) }
            .map { logbookReportEntity ->
                val pnoMessage = objectMapper.readValue(logbookReportEntity.message, PNO::class.java)
                pnoMessage.isBeingSent = isBeingSent
                pnoMessage.isSent = isSent
                pnoMessage.isVerified = isVerified

                val nextMessage = objectMapper.writeValueAsString(pnoMessage)
                val updatedEntity = logbookReportEntity.copy(message = nextMessage)

                dbLogbookReportRepository.save(updatedEntity)
            }
    }

    @Transactional
    override fun updatePriorNotificationAuthorTrigramAndNote(
        reportId: String,
        operationDate: ZonedDateTime,

        authorTrigram: String?,
        note: String?,
    ) {
        val logbookReportEntities =
            dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            )
        if (logbookReportEntities.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        // We need to update both DAT and related COR operations (which also covers orphan COR cases)
        logbookReportEntities
            .filter { it.operationType in listOf(LogbookOperationType.DAT, LogbookOperationType.COR) }
            .map { logbookReportEntity ->
                val pnoMessage = objectMapper.readValue(logbookReportEntity.message, PNO::class.java)
                if (
                    !Utils.areStringsEqual(authorTrigram, pnoMessage.authorTrigram) ||
                    !Utils.areStringsEqual(note, pnoMessage.note)
                ) {
                    pnoMessage.authorTrigram = authorTrigram
                    pnoMessage.note = note

                    /**
                     * The PNO states are re-initialized:
                     * - the PDF will be re-generated (done in the use case by deleting the old one)
                     * - the PNO will require another verification before sending
                     */
                    pnoMessage.isVerified = false

                    val nextMessage = objectMapper.writeValueAsString(pnoMessage)

                    val updatedEntity = logbookReportEntity.copy(message = nextMessage)

                    dbLogbookReportRepository.save(updatedEntity)
                }
            }
    }

    @Transactional
    override fun invalidate(reportId: String, operationDate: ZonedDateTime) {
        val logbookReportEntities =
            dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
                reportId,
                operationDate.withZoneSameInstant(UTC).toString(),
            )
        if (logbookReportEntities.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        // We need to update both DAT and related COR operations (which also covers orphan COR cases)
        logbookReportEntities
            .filter { it.operationType in listOf(LogbookOperationType.DAT, LogbookOperationType.COR) }
            .map { logbookReportEntity ->
                val pnoMessage = objectMapper.readValue(logbookReportEntity.message, PNO::class.java)
                pnoMessage.isInvalidated = true

                val nextMessage = objectMapper.writeValueAsString(pnoMessage)

                val updatedEntity = logbookReportEntity.copy(message = nextMessage)

                dbLogbookReportRepository.save(updatedEntity)
            }
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String) =
        "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    companion object {
        fun mapToReferenceWithRelatedModels(
            allLogbookReportModels: List<LogbookReportEntity>,
        ): List<Pair<LogbookReportEntity, List<LogbookReportEntity>>> {
            // DAT operations are references by definition
            val datLogbookReportModels = allLogbookReportModels.filter { it.operationType == LogbookOperationType.DAT }
            // Orphan COR operations are also considered as references for lack of anything better
            // They can be orphan for various reasons, like an error along the external JPE flow.
            val orphanCorLogbookReportModels = allLogbookReportModels
                .filter { it.operationType == LogbookOperationType.COR }
                .filter { corOperation ->
                    corOperation.referencedReportId == null ||
                        datLogbookReportModels.none { it.reportId == corOperation.referencedReportId }
                }
            val referenceLogbookReportModels = datLogbookReportModels + orphanCorLogbookReportModels

            return referenceLogbookReportModels.map { referenceLogbookReportModel ->
                val directlyAssociatedLogbookReportModels = allLogbookReportModels.filter {
                    it.referencedReportId == referenceLogbookReportModel.reportId
                }
                // COR operation also have their own `reportId` which can also be associated to their own operations
                // For example, a RET (aknlowledgement) operation can be associated to a COR operation.
                val directlyAssociatedReportIds = directlyAssociatedLogbookReportModels.mapNotNull { it.reportId }
                val indirectlyAssociatedLogbookReportModels = allLogbookReportModels.filter {
                    it.referencedReportId in directlyAssociatedReportIds
                }
                val associatedLogbookReportModels = directlyAssociatedLogbookReportModels +
                    indirectlyAssociatedLogbookReportModels

                Pair(referenceLogbookReportModel, associatedLogbookReportModels)
            }
        }
    }
}
