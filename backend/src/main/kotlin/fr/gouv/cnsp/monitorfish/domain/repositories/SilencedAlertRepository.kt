package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import java.time.ZonedDateTime

interface SilencedAlertRepository {
    fun save(
        alert: PendingAlert,
        silencedBeforeDate: ZonedDateTime,
        isValidated: Boolean,
    ): SilencedAlert

    fun save(silencedAlert: SilencedAlert): SilencedAlert

    fun findAllCurrentSilencedAlerts(): List<SilencedAlert>

    fun delete(id: Int)

    fun deleteSixMonthsOldSilencedAlerts()

    // For test purpose
    fun findAll(): List<SilencedAlert>
}
