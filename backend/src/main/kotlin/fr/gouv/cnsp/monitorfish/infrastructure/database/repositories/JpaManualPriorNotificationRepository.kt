package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

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
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaManualPriorNotificationRepository(
    private val dbManualPriorNotificationRepository: DBManualPriorNotificationRepository,
) : ManualPriorNotificationRepository {
    override fun findAll(filter: PriorNotificationsFilter): List<PriorNotification> {
        return dbManualPriorNotificationRepository
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
            ).map { it.toPriorNotification() }
    }

    @Cacheable(value = ["manual_pno_to_verify"])
    override fun findAllToVerify(): List<PriorNotification> {
        return dbManualPriorNotificationRepository
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
                willArriveAfter = CustomZonedDateTime(ZonedDateTime.now()).toString(),
                willArriveBefore = CustomZonedDateTime(ZonedDateTime.now().plusHours(24)).toString(),
            ).filter {
                it.value.isInVerificationScope == true &&
                    it.value.isVerified == false &&
                    it.value.isInvalidated != true
            }
            .map {
                it.toPriorNotification()
            }
    }

    override fun findByReportId(reportId: String): PriorNotification? {
        return dbManualPriorNotificationRepository.findByReportId(reportId)?.toPriorNotification()
    }

    @Transactional
    @CacheEvict(value = ["pno_to_verify"], allEntries = true)
    override fun save(newOrNextPriorNotification: PriorNotification): PriorNotification {
        try {
            val manualPriorNotificationEntity = dbManualPriorNotificationRepository
                .save(ManualPriorNotificationEntity.fromPriorNotification(newOrNextPriorNotification, true))

            return manualPriorNotificationEntity.toPriorNotification()
        } catch (e: IllegalArgumentException) {
            throw BackendInternalException(
                "Error while saving the prior notification (likely because a non-nullable variable is null).",
                e,
            )
        }
    }

    @Transactional
    @CacheEvict(value = ["manual_pno_to_verify"], allEntries = true)
    override fun updateState(reportId: String, isBeingSent: Boolean, isVerified: Boolean) {
        val manualPriorNotification =
            dbManualPriorNotificationRepository.findByReportId(reportId) ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND,
            )

        val nextPnoValue: PNO = manualPriorNotification.value
        nextPnoValue.isBeingSent = isBeingSent
        nextPnoValue.isVerified = isVerified

        val updatedManualPriorNotification = manualPriorNotification.copy(value = nextPnoValue)

        dbManualPriorNotificationRepository.save(updatedManualPriorNotification)
    }

    @Transactional
    override fun invalidate(reportId: String) {
        val manualPriorNotification =
            dbManualPriorNotificationRepository.findByReportId(reportId) ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND,
            )

        val nextPnoValue: PNO = manualPriorNotification.value
        nextPnoValue.isInvalidated = true

        val updatedManualPriorNotification = manualPriorNotification.copy(value = nextPnoValue)

        dbManualPriorNotificationRepository.save(updatedManualPriorNotification)
    }
}
