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
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import kotlin.reflect.full.declaredMemberProperties
import kotlin.reflect.jvm.isAccessible
import kotlin.reflect.jvm.javaField

@Repository
class JpaManualPriorNotificationRepository(
    private val dbManualPriorNotificationRepository: DBManualPriorNotificationRepository,
) : ManualPriorNotificationRepository {
    override fun findAll(filter: PriorNotificationsFilter): List<PriorNotification> {
        // Manual prior notifications are only for less than 12 meters vessels
        if (filter.isLessThanTwelveMetersVessel == false) {
            return emptyList()
        }

        return dbManualPriorNotificationRepository
            .findAll(
                flagStates = filter.flagStates ?: emptyList(),
                hasOneOrMoreReportings = filter.hasOneOrMoreReportings,
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

    override fun findByReportId(reportId: String): PriorNotification? {
        return dbManualPriorNotificationRepository.findByReportId(reportId)?.toPriorNotification()
    }

    @Transactional
    override fun save(newOrNextPriorNotification: PriorNotification): String {
        try {
            val manualPriorNotificationEntity = dbManualPriorNotificationRepository
                .save(ManualPriorNotificationEntity.fromPriorNotification(newOrNextPriorNotification, true))

            return requireNotNull(manualPriorNotificationEntity.reportId)
        } catch (e: IllegalArgumentException) {
            throw BackendInternalException(
                "Error while saving the prior notification (likely because a non-nullable variable is null).",
                e,
            )
        }
    }

    @Transactional
    override fun updateState(reportId: String, isBeingSent: Boolean, isVerified: Boolean) {
        val manualPriorNotificationEntity =
            dbManualPriorNotificationRepository.findByReportId(reportId) ?: throw BackendUsageException(
                BackendUsageErrorCode.NOT_FOUND,
            )

        val nextPnoValue: PNO = manualPriorNotificationEntity.value
        nextPnoValue.isBeingSent = isBeingSent
        nextPnoValue.isVerified = isVerified

        // We use a reflection to update the entity `value` prop since it's immutable
        val pnoValueRefection = ManualPriorNotificationEntity::class.declaredMemberProperties
            .find { it.name == "value" }
        pnoValueRefection?.let {
            it.isAccessible = true
            val field = it.javaField
            field?.isAccessible = true
            field?.set(manualPriorNotificationEntity, nextPnoValue)
        }

        dbManualPriorNotificationRepository.save(manualPriorNotificationEntity)
    }
}
