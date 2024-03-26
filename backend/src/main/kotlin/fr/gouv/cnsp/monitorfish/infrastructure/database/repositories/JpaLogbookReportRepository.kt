package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.RiskFactorsEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Join
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

@Repository
class JpaLogbookReportRepository(
    private val dbERSRepository: DBLogbookReportRepository,
    @Autowired private val entityManager: EntityManager,
    private val mapper: ObjectMapper,
) : LogbookReportRepository {
    private val postgresChunkSize = 5000

    override fun findAllPriorNotifications(filter: LogbookReportFilter): List<PriorNotification> {
        val criteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery = criteriaBuilder.createQuery(LogbookReportEntity::class.java)
        val logbookReportEntity = criteriaQuery.from(LogbookReportEntity::class.java)

        val predicates = mutableListOf(criteriaBuilder.isTrue(criteriaBuilder.literal(true)))

        // Only enriched PNO messages
        predicates.add(
            criteriaBuilder.and(
                criteriaBuilder.equal(logbookReportEntity.get<String>("messageType"), "PNO"),
                criteriaBuilder.equal(logbookReportEntity.get<Boolean>("isEnriched"), true),
            ),
        )

        filter.willArriveAfter?.let { willArriveAfter ->
            predicates.add(getWillArriveAfterPredicate(willArriveAfter, criteriaBuilder, logbookReportEntity))
        }
        filter.willArriveBefore?.let { willArriveBefore ->
            predicates.add(getWillArriveBeforePredicate(willArriveBefore, criteriaBuilder, logbookReportEntity))
        }
        filter.flagStates?.let { flagStates ->
            predicates.add(getFlagStatesPredicate(flagStates, logbookReportEntity))
        }
        filter.isLessThanTwelveMetersVessel?.let { isLessThanTwelveMetersVessel ->
            predicates.add(
                getIsLessThanTwelveMetersVesselPredicate(
                    isLessThanTwelveMetersVessel,
                    criteriaBuilder,
                    logbookReportEntity,
                ),
            )
        }
        filter.lastControlledAfter?.let { lastControlledAfter ->
            predicates.add(getLastControlledAfterPredicate(lastControlledAfter, criteriaBuilder, logbookReportEntity))
        }
        filter.lastControlledBefore?.let { lastControlledBefore ->
            predicates.add(getLastControlledBeforePredicate(lastControlledBefore, criteriaBuilder, logbookReportEntity))
        }
        filter.portLocodes?.let { portLocodes ->
            predicates.add(getPortLocodesPredicate(portLocodes, criteriaBuilder, logbookReportEntity))
        }
        filter.priorNotificationTypes?.let { types ->
            predicates.add(getPriorNotificationTypesPredicate(types, criteriaBuilder, logbookReportEntity))
        }
        filter.searchQuery?.let { searchQuery ->
            predicates.add(getSearchQueryPredicate(searchQuery, criteriaBuilder, logbookReportEntity))
        }
        filter.specyCodes?.let { specyCodes ->
            predicates.add(getSpecyCodesPredicate(specyCodes, criteriaBuilder, logbookReportEntity))
        }
        filter.tripGearCodes?.let { tripGearCodes ->
            predicates.add(getTripGearCodesPredicate(tripGearCodes, criteriaBuilder, logbookReportEntity))
        }
        filter.tripSegmentSegments?.let { tripSegmentSegments ->
            predicates.add(getTripSegmentSegmentsPredicate(tripSegmentSegments, criteriaBuilder, logbookReportEntity))
        }

        criteriaQuery.select(logbookReportEntity).where(*predicates.toTypedArray())

        return entityManager.createQuery(criteriaQuery).resultList.map { it.toPriorNotification(mapper) }
    }

    override fun findLastTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbERSRepository.findTripsBeforeDatetime(
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
                    dbERSRepository.findPreviousTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val previousTrip =
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
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
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
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
                    dbERSRepository.findNextTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val nextTrip =
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
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
                return dbERSRepository.findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDate.toInstant().toString(),
                    beforeDate.toInstant().toString(),
                    tripNumber,
                ).map {
                    it.toLogbookMessage(mapper)
                }
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<LogbookMessage, LogbookMessage?>> {
        val lanAndPnoMessages = dbERSRepository.findAllLANAndPNONotProcessedByRule(ruleType)

        val lanAndPnoMessagesWithoutCorrectedMessages =
            lanAndPnoMessages.filter { lanMessage ->
                getCorrectedMessageIfAvailable(lanMessage, lanAndPnoMessages)
            }

        return lanAndPnoMessagesWithoutCorrectedMessages.filter {
            it.internalReferenceNumber != null &&
                it.tripNumber != null &&
                it.messageType == LogbookMessageTypeMapping.LAN.name
        }.map { lanMessage ->
            val pnoMessage =
                lanAndPnoMessagesWithoutCorrectedMessages.singleOrNull { message ->
                    message.internalReferenceNumber == lanMessage.internalReferenceNumber &&
                        message.tripNumber == lanMessage.tripNumber &&
                        message.messageType == LogbookMessageTypeMapping.PNO.name
                }

            Pair(lanMessage.toLogbookMessage(mapper), pnoMessage?.toLogbookMessage(mapper))
        }
    }

    override fun findDistinctPriorNotificationTypes(): List<String> {
        return dbERSRepository.findDistinctPriorNotificationType()
    }

    override fun updateLogbookMessagesAsProcessedByRule(
        ids: List<Long>,
        ruleType: String,
    ) {
        ids.chunked(postgresChunkSize).forEach {
            dbERSRepository.updateERSMessagesAsProcessedByRule(it, ruleType)
        }
    }

    override fun findById(id: Long): LogbookMessage {
        return dbERSRepository.findById(id)
            .get().toLogbookMessage(mapper)
    }

    override fun findLastMessageDate(): ZonedDateTime {
        return dbERSRepository.findLastOperationDateTime().atZone(UTC)
    }

    override fun findFirstAcknowledgedDateOfTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): ZonedDateTime {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbERSRepository.findTripsBeforeDatetime(
                        internalReferenceNumber,
                        beforeDateTime.toInstant(),
                        PageRequest.of(0, 1),
                    ).first()

                return dbERSRepository.findFirstAcknowledgedDateOfTrip(
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
        return dbERSRepository.findLastTwoYearsTripNumbers(internalReferenceNumber)
    }

    // For test purpose
    @Modifying
    @Transactional
    override fun deleteAll() {
        dbERSRepository.deleteAll()
    }

    @Modifying
    @Transactional
    override fun save(message: LogbookMessage) {
        dbERSRepository.save(LogbookReportEntity.fromLogbookMessage(mapper, message))
    }

    private fun getCorrectedMessageIfAvailable(
        pnoMessage: LogbookReportEntity,
        messages: List<LogbookReportEntity>,
    ): Boolean {
        return if (pnoMessage.operationType == LogbookOperationType.DAT) {
            !messages.any {
                it.operationType == LogbookOperationType.COR && it.referencedReportId == pnoMessage.reportId
            }
        } else {
            true
        }
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String) =
        "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    private fun getFlagStatesPredicate(
        flagStates: List<String>,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return logbookReportEntity.get<String>("flagState").`in`(flagStates)
    }

    private fun getIsLessThanTwelveMetersVesselPredicate(
        isLessThanTwelveMetersVessel: Boolean,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val vessel: Join<LogbookReportEntity, RiskFactorsEntity> = logbookReportEntity.join("vessel")

        return if (isLessThanTwelveMetersVessel) {
            criteriaBuilder.lessThan(vessel.get("length"), 12)
        } else {
            criteriaBuilder.greaterThanOrEqualTo(vessel.get("length"), 12)
        }
    }

    private fun getLastControlledAfterPredicate(
        lastControlledAfter: String,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val vesselRiskFactor: Join<LogbookReportEntity, RiskFactorsEntity> = logbookReportEntity.join(
            "vesselRiskFactor",
        )

        return criteriaBuilder.greaterThanOrEqualTo(
            vesselRiskFactor.get("lastControlDatetime"),
            ZonedDateTime.parse(lastControlledAfter, DateTimeFormatter.ISO_ZONED_DATE_TIME),
        )
    }

    private fun getLastControlledBeforePredicate(
        lastControlledBefore: String,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val vesselRiskFactor: Join<LogbookReportEntity, RiskFactorsEntity> = logbookReportEntity.join(
            "vesselRiskFactor",
        )

        return criteriaBuilder.lessThanOrEqualTo(
            vesselRiskFactor.get("lastControlDatetime"),
            ZonedDateTime.parse(lastControlledBefore, DateTimeFormatter.ISO_ZONED_DATE_TIME),
        )
    }

    private fun getPortLocodesPredicate(
        portLocodes: List<String>,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return criteriaBuilder.function(
            "jsonb_extract_path_text",
            String::class.java,
            logbookReportEntity.get<String>("message"),
            criteriaBuilder.literal("port"),
        ).`in`(portLocodes)
    }

    private fun getPriorNotificationTypesPredicate(
        types: List<String>,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return criteriaBuilder.isTrue(
            criteriaBuilder.function(
                "jsonb_contains_any",
                Boolean::class.java,
                logbookReportEntity.get<String>("message"),
                criteriaBuilder.literal(arrayOf("pnoTypes")),
                criteriaBuilder.literal("pnoTypeName"),
                criteriaBuilder.literal(types.toTypedArray()),
            ),
        )
    }

    private fun getSearchQueryPredicate(
        searchQuery: String,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val normalizedPath =
            criteriaBuilder.lower(
                criteriaBuilder.function(
                    "unaccent",
                    String::class.java,
                    logbookReportEntity.get<String>("vesselName"),
                ),
            )
        val searchQueryPattern = "%${searchQuery.trim()}%"
        val normalizedSearchQuery =
            criteriaBuilder.lower(
                criteriaBuilder.function(
                    "unaccent",
                    String::class.java,
                    criteriaBuilder.literal(searchQueryPattern),
                ),
            )

        return criteriaBuilder.like(
            normalizedPath,
            normalizedSearchQuery,
        )
    }

    private fun getSpecyCodesPredicate(
        specyCodes: List<String>,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return criteriaBuilder.isTrue(
            criteriaBuilder.function(
                "jsonb_contains_any",
                Boolean::class.java,
                logbookReportEntity.get<String>("message"),
                criteriaBuilder.literal(arrayOf("catchOnboard")),
                criteriaBuilder.literal("species"),
                criteriaBuilder.literal(specyCodes.toTypedArray()),
            ),
        )
    }

    private fun getTripGearCodesPredicate(
        tripGearCodes: List<String>,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return criteriaBuilder.isTrue(
            criteriaBuilder.function(
                "jsonb_contains_any",
                Boolean::class.java,
                logbookReportEntity.get<String>("tripGears"),
                criteriaBuilder.literal(emptyArray<String>()),
                criteriaBuilder.literal("gear"),
                criteriaBuilder.literal(tripGearCodes.toTypedArray()),
            ),
        )
    }

    private fun getTripSegmentSegmentsPredicate(
        tripSegmentSegments: List<String>,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        return criteriaBuilder.isTrue(
            criteriaBuilder.function(
                "jsonb_contains_any",
                Boolean::class.java,
                logbookReportEntity.get<String>("tripSegments"),
                criteriaBuilder.literal(emptyArray<String>()),
                criteriaBuilder.literal("segment"),
                criteriaBuilder.literal(tripSegmentSegments.toTypedArray()),
            ),
        )
    }

    private fun getWillArriveAfterPredicate(
        willArriveAfter: String,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val predictedArrivalDatetimeUtcAsTimestamp =
            criteriaBuilder.function(
                "jsonb_to_timestamp",
                ZonedDateTime::class.java,
                logbookReportEntity.get<String>("message"),
                criteriaBuilder.literal("predictedArrivalDatetimeUtc"),
            )

        return criteriaBuilder.greaterThanOrEqualTo(
            predictedArrivalDatetimeUtcAsTimestamp,
            ZonedDateTime.parse(willArriveAfter).withZoneSameInstant(UTC),
        )
    }

    private fun getWillArriveBeforePredicate(
        willArriveBefore: String,
        criteriaBuilder: CriteriaBuilder,
        logbookReportEntity: Root<LogbookReportEntity>,
    ): Predicate {
        val predictedArrivalDatetimeUtcAsTimestamp =
            criteriaBuilder.function(
                "jsonb_to_timestamp",
                ZonedDateTime::class.java,
                logbookReportEntity.get<String>("message"),
                criteriaBuilder.literal("predictedArrivalDatetimeUtc"),
            )

        return criteriaBuilder.lessThanOrEqualTo(
            predictedArrivalDatetimeUtcAsTimestamp,
            ZonedDateTime.parse(willArriveBefore).withZoneSameInstant(UTC),
        )
    }
}
