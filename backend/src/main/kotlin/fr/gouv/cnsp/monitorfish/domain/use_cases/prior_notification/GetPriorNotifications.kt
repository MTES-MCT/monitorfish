package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class GetPriorNotifications(
    private val facadeAreasRepository: FacadeAreasRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
) {
    fun execute(filter: LogbookReportFilter): List<PriorNotification> {
        val priorNotificationsWithoutReportingsCount =
            logbookReportRepository.findAllPriorNotifications(filter).map { priorNotification ->
                val port = try {
                    (priorNotification.logbookMessage.message as PNO).port?.let {
                        portRepository.find(it)
                    }
                } catch (e: CodeNotFoundException) {
                    null
                }

                val seaFront = getSeaFrontFromPort(port)

                priorNotification.copy(
                    port = port,
                    seaFront = seaFront,
                )
            }

        val priorNotifications = enrichPriorNotificationsWithReportingCount(priorNotificationsWithoutReportingsCount)

        return priorNotifications
    }

    private fun enrichPriorNotificationsWithReportingCount(
        priorNotifications: List<PriorNotification>,
    ): List<PriorNotification> {
        val currentReportings = reportingRepository.findAll(
            ReportingFilter(
                vesselInternalReferenceNumbers = priorNotifications.mapNotNull { it.vessel.internalReferenceNumber },
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.INFRACTION_SUSPICION),
            ),
        )

        val priorNotificationsWithReportingCount = priorNotifications.map { priorNotification ->
            val reportingsCount = currentReportings.count { reporting ->
                reporting.internalReferenceNumber == priorNotification.vessel.internalReferenceNumber
            }

            priorNotification.copy(reportingsCount = reportingsCount)
        }

        return priorNotificationsWithReportingCount
    }

    private fun getSeaFrontFromPort(port: Port?): String? {
        if (port?.latitude == null || port.longitude == null) {
            return null
        }

        // Cached call
        val facadeAreas = facadeAreasRepository.findAll()
        val point = GeometryFactory().createPoint(Coordinate(port.longitude, port.latitude))

        return facadeAreas.find { facadeArea ->
            facadeArea.geometry.contains(point)
        }?.facade
    }
}
