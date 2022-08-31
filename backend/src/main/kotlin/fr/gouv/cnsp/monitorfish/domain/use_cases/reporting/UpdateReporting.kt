package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class UpdateReporting(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateReporting::class.java)

    fun execute(reportingId: Int, updatedInfractionSuspicion: UpdatedInfractionSuspicion): Reporting {
        logger.info("Updating reporting id $reportingId")
        val currentReporting = reportingRepository.findById(reportingId)

        require(currentReporting.type === ReportingType.INFRACTION_SUSPICION) {
            "The edited reporting must be an INFRACTION_SUSPICION"
        }

        currentReporting.value as InfractionSuspicion
        updatedInfractionSuspicion.flagState = currentReporting.value.flagState

        val nextInfractionSuspicion = InfractionSuspicion.fromUpdatedReporting(updatedInfractionSuspicion)
        nextInfractionSuspicion.checkReportingActorAndFieldsRequirements()

        return reportingRepository.update(reportingId, nextInfractionSuspicion)
    }
}
