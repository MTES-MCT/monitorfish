package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import java.time.ZonedDateTime

@UseCase
class GetPriorNotifications(
    private val facadeAreasRepository: FacadeAreasRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
) {
    fun execute(filter: LogbookReportFilter): List<PriorNotification> {
        val priorNotifications =
            logbookReportRepository.findAllPriorNotifications(filter).map { priorNotification ->
                val port =
                    try {
                        priorNotification.portLocode?.let {
                            portRepository.find(it)
                        }
                    } catch (e: CodeNotFoundException) {
                        null
                    }

                // TODO Doesn't seem to work.
                val seaFront =
                    port?.latitude?.let { latitude ->
                        port.longitude?.let { longitude ->
                            val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))

                            facadeAreasRepository.findByIncluding(point).firstOrNull()?.facade
                        }
                    }

                val reportingsCount =
                    priorNotification.vesselId.let { vesselId ->
                        reportingRepository.findCurrentAndArchivedByVesselIdEquals(
                            vesselId,
                            // TODO Fix that.
                            fromDate = ZonedDateTime.now().minusYears(2),
                        ).count()
                    }

                priorNotification.copy(
                    portName = port?.name,
                    reportingsCount = reportingsCount,
                    seaFront = seaFront,
                )
            }

        return priorNotifications
    }
}
