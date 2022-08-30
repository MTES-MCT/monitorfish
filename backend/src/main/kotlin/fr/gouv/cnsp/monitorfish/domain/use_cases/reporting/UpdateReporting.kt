package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.lang.IllegalArgumentException

@UseCase
class UpdateReporting(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateReporting::class.java)

    fun execute(reportingId: Int, updatedReporting: UpdatedReporting): Reporting {
        logger.info("Updating reporting id $reportingId")
        val currentReporting = reportingRepository.findById(reportingId)

        when (currentReporting.type) {
            ReportingType.INFRACTION_SUSPICION -> InfractionSuspicion.fromUpdatedReporting(updatedReporting)
                .checkReportingActorAndFieldsRequirements()
            ReportingType.OBSERVATION -> Observation.fromUpdatedReporting(updatedReporting)
                .checkReportingActorAndFieldsRequirements()
            else -> throw IllegalArgumentException("The updated reporting must be an OBSERVATION or INFRACTION_SUSPICION")
        }

      if (currentReporting.type == ReportingType.INFRACTION_SUSPICION) {
        require(!updatedReporting.dml.isNullOrEmpty()) {
          "A DML must be set"
        }

        updatedReporting.seaFront = Reporting.getSeaFrontFromDML(updatedReporting.dml)
      }

        updatedReporting.type = currentReporting.type.name
      return reportingRepository.update(reportingId, updatedReporting)
    }
}
