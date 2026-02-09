package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ManualPriorNotificationEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaManualPriorNotificationRepository(
    private val dbManualPriorNotificationRepository: DBManualPriorNotificationRepository,
    private val mapper: ObjectMapper,
) : ManualPriorNotificationRepository {
    override fun findAll(filter: PriorNotificationsFilter): List<PriorNotification> =
        dbManualPriorNotificationRepository
            .findAll(
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
            ).map { it.toPriorNotification(mapper) }

    @Cacheable(value = ["manual_pno_to_verify"])
    override fun findAllToVerify(): List<PriorNotification> =
        dbManualPriorNotificationRepository
            .findAll(
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
                willArriveAfter = ZonedDateTime.now().minusHours(24),
                willArriveBefore = ZonedDateTime.now().plusHours(24),
            ).map {
                it.toPriorNotification(mapper)
            }.filter {
                (it.logbookMessageAndValue.logbookMessage.message as PNO).isInVerificationScope == true &&
                    (it.logbookMessageAndValue.logbookMessage.message as PNO).isVerified == false &&
                    (it.logbookMessageAndValue.logbookMessage.message as PNO).isInvalidated != true
            }

    override fun findByReportId(reportId: String): PriorNotification? =
        dbManualPriorNotificationRepository.findByReportId(reportId)?.toPriorNotification(mapper)

    @Transactional
    @CacheEvict(value = ["manual_pno_to_verify"], allEntries = true)
    override fun save(newOrNextPriorNotification: PriorNotification): PriorNotification {
        try {
            val manualPriorNotificationEntity =
                dbManualPriorNotificationRepository
                    .save(ManualPriorNotificationEntity.fromPriorNotification(
                        mapper = mapper,
                        priorNotification = newOrNextPriorNotification
                    ))

            return manualPriorNotificationEntity.toPriorNotification(mapper)
        } catch (e: IllegalArgumentException) {
            throw BackendInternalException(
                "Error while saving the prior notification (likely because a non-nullable variable is null).",
                e,
            )
        }
    }

    @Transactional
    @CacheEvict(value = ["manual_pno_to_verify"], allEntries = true)
    override fun updateState(
        reportId: String,
        isBeingSent: Boolean,
        isSent: Boolean,
        isVerified: Boolean,
    ) {
        val manualPriorNotification =
            dbManualPriorNotificationRepository.findByReportId(reportId) ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND,
            )

        val nextPnoValue: PNO = mapper.readValue(manualPriorNotification.value, PNO::class.java)
        nextPnoValue.isBeingSent = isBeingSent
        nextPnoValue.isSent = isSent
        nextPnoValue.isVerified = isVerified

        val updatedManualPriorNotification = manualPriorNotification
            .copy(value = mapper.writeValueAsString(nextPnoValue))

        dbManualPriorNotificationRepository.save(updatedManualPriorNotification)
    }

    @Transactional
    @CacheEvict(value = ["manual_pno_to_verify"], allEntries = true)
    override fun invalidate(reportId: String) {
        val manualPriorNotification =
            dbManualPriorNotificationRepository.findByReportId(reportId) ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND,
            )

        val nextPnoValue: PNO = mapper.readValue(manualPriorNotification.value, PNO::class.java)
        nextPnoValue.isInvalidated = true

        val updatedManualPriorNotification = manualPriorNotification
            .copy(value = mapper.writeValueAsString(nextPnoValue))

        dbManualPriorNotificationRepository.save(updatedManualPriorNotification)
    }
}
