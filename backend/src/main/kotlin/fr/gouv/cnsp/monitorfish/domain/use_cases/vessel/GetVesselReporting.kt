package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentAndArchivedReporting
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselReporting(private val reportingRepository: ReportingRepository,
                         private val infractionRepository: InfractionRepository) {
    private val logger = LoggerFactory.getLogger(GetVesselReporting::class.java)

    fun execute(internalReferenceNumber: String,
                externalReferenceNumber: String,
                ircs: String,
                vesselIdentifier: VesselIdentifier?,
                fromDate: ZonedDateTime): CurrentAndArchivedReporting {
        val reporting = when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(vesselIdentifier, internalReferenceNumber, fromDate)
            VesselIdentifier.IRCS ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(vesselIdentifier, ircs, fromDate)
            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(vesselIdentifier, externalReferenceNumber, fromDate)
            else -> reportingRepository.findCurrentAndArchivedWithoutVesselIdentifier(
                    internalReferenceNumber,
                    externalReferenceNumber,
                    ircs,
                    fromDate)
        }

        val current = reporting
                .filter { !it.isArchived }
                .map { report ->
                    report.value.natinfCode?.let {
                        try {
                            report.infraction = infractionRepository.findInfractionByNatinfCode(it)
                        } catch (e: NatinfCodeNotFoundException) {
                            logger.warn(e.message)
                        }
                    }

                    report
                }

        val archived = reporting
                .filter { it.isArchived }
                .map { report ->
                    report.value.natinfCode?.let {
                        try {
                            report.infraction = infractionRepository.findInfractionByNatinfCode(it)
                        } catch (e: NatinfCodeNotFoundException) {
                            logger.warn(e.message)
                        }
                    }

                    report
                }

        return CurrentAndArchivedReporting(current, archived)
    }
}
