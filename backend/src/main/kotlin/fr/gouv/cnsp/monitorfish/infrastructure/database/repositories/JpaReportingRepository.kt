package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBReportingRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaReportingRepository(private val dbReportingRepository: DBReportingRepository,
                             private val mapper: ObjectMapper) : ReportingRepository {

    override fun save(alert: PendingAlert, validationDate: ZonedDateTime?) {
        dbReportingRepository.save(ReportingEntity.fromPendingAlert(alert, validationDate, mapper))
    }

    override fun findAll(): List<Reporting> {
        return dbReportingRepository.findAll().map { it.toReporting(mapper) }
    }
}
