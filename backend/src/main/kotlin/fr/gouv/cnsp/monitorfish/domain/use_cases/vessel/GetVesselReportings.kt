package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReportings
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselReportings(
    private val reportingRepository: ReportingRepository,
    private val infractionRepository: InfractionRepository,
    private val getAllControlUnits: GetAllControlUnits,
) {
    private val logger = LoggerFactory.getLogger(GetVesselReportings::class.java)

    fun execute(
        vesselId: Int?,
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        vesselIdentifier: VesselIdentifier?,
        fromDate: ZonedDateTime,
    ): CurrentAndArchivedReportings {
        val controlUnits = getAllControlUnits.execute()

        val reportings = findReportings(
            vesselId,
            vesselIdentifier,
            internalReferenceNumber,
            fromDate,
            ircs,
            externalReferenceNumber,
        )

        val current = reportings
            .filter { !it.isArchived }
            .map { report ->
                report.value.natinfCode?.let {
                    try {
                        report.infraction = infractionRepository.findInfractionByNatinfCode(it)
                    } catch (e: NatinfCodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }

                if (report.type == ReportingType.ALERT) {
                    return@map Pair(report, null)
                }

                val controlUnitId = (report.value as InfractionSuspicionOrObservationType).controlUnitId
                return@map Pair(report, controlUnits.find { it.id == controlUnitId })
            }

        val archived = reportings
            .filter { it.isArchived }
            .map { report ->
                report.value.natinfCode?.let {
                    try {
                        report.infraction = infractionRepository.findInfractionByNatinfCode(it)
                    } catch (e: NatinfCodeNotFoundException) {
                        logger.warn(e.message)
                    }
                }

                if (report.type == ReportingType.ALERT) {
                    return@map Pair(report, null)
                }

                val controlUnitId = (report.value as InfractionSuspicionOrObservationType).controlUnitId
                return@map Pair(report, controlUnits.find { it.id == controlUnitId })
            }

        return CurrentAndArchivedReportings(current, archived)
    }

    private fun findReportings(
        vesselId: Int?,
        vesselIdentifier: VesselIdentifier?,
        internalReferenceNumber: String,
        fromDate: ZonedDateTime,
        ircs: String,
        externalReferenceNumber: String,
    ): List<Reporting> {
        if (vesselId != null) {
            return reportingRepository.findCurrentAndArchivedByVesselIdEquals(vesselId, fromDate)
        }

        return when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                    vesselIdentifier,
                    internalReferenceNumber,
                    fromDate,
                )

            VesselIdentifier.IRCS ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(vesselIdentifier, ircs, fromDate)

            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                    vesselIdentifier,
                    externalReferenceNumber,
                    fromDate,
                )

            else -> reportingRepository.findCurrentAndArchivedWithoutVesselIdentifier(
                internalReferenceNumber,
                externalReferenceNumber,
                ircs,
                fromDate,
            )
        }
    }
}
