package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotification
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.*
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory

@UseCase
class GetPriorNotifications(
    private val facadeAreasRepository: JpaFacadeAreasRepository,
    private val logbookReportRepository: JpaLogbookReportRepository,
    private val portRepository: JpaPortRepository,
    private val reportingRepository: JpaReportingRepository,
    private val riskFactorRepository: JpaRiskFactorsRepository,
    private val vesselRepository: JpaVesselRepository,
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

                val vessel =
                    vesselRepository.findVessel(
                        priorNotification.logbookMessage?.internalReferenceNumber,
                        priorNotification.logbookMessage?.externalReferenceNumber,
                        priorNotification.logbookMessage?.ircs,
                    )

                val reportingsCount =
                    vessel?.id.let { vesselId ->
                        val reportingsFilter =
                            ReportingFilter(
                                isArchived = false,
                                isDeleted = false,
                                vesselId = vesselId,
                            )

                        reportingRepository.findAll(reportingsFilter).count()
                    }

                val vesselRiskFactor =
                    priorNotification.logbookMessage?.internalReferenceNumber?.let {
                        riskFactorRepository.findVesselRiskFactors(it)
                    }

                priorNotification.copy(
                    port = port,
                    reportingsCount = reportingsCount,
                    seaFront = seaFront,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )
            }

        return priorNotifications
    }
}
