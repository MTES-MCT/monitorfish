package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class UpdateReporting(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateReporting::class.java)

    fun execute(reportingId: Int, updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation): Reporting {
        logger.info("Updating reporting id $reportingId")
        val currentReporting = reportingRepository.findById(reportingId)

        return when (currentReporting.type) {
            ReportingType.ALERT -> throw IllegalArgumentException("The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION")
            ReportingType.OBSERVATION -> {
                currentReporting.value as InfractionSuspicionOrObservationType
                updatedInfractionSuspicionOrObservation.flagState = currentReporting.value.flagState

                val nextObservation = Observation.fromUpdatedReporting(updatedInfractionSuspicionOrObservation)
                nextObservation.checkReportingActorAndFieldsRequirements()

                reportingRepository.update(reportingId, nextObservation)
            }
            ReportingType.INFRACTION_SUSPICION -> {
                currentReporting.value as InfractionSuspicionOrObservationType
                updatedInfractionSuspicionOrObservation.flagState = currentReporting.value.flagState

                val nextInfractionSuspicion = InfractionSuspicion.fromUpdatedReporting(updatedInfractionSuspicionOrObservation)
                nextInfractionSuspicion.checkReportingActorAndFieldsRequirements()

                reportingRepository.update(reportingId, nextInfractionSuspicion)
            }
        }
    }
}
