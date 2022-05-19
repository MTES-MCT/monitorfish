package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import java.time.ZonedDateTime

interface ReportingRepository {
    fun save(alert: PendingAlert, validationDate: ZonedDateTime?)
    fun findAll(): List<Reporting>
}
