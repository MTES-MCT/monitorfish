package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class UpdateReporting(
    private val reportingRepository: ReportingRepository,
    private val getInfractionSuspicionWithDMLAndSeaFront: GetInfractionSuspicionWithDMLAndSeaFront,
) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateReporting::class.java)

    fun execute(reportingId: Int, updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation): Reporting {
        val currentReporting = reportingRepository.findById(reportingId)
        logger.info("Updating reporting id $reportingId for vessel id ${currentReporting.vesselId}")

        require(currentReporting.type != ReportingType.ALERT) {
            "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION"
        }

        return when (updatedInfractionSuspicionOrObservation.type) {
            ReportingType.OBSERVATION -> {
                currentReporting.value as InfractionSuspicionOrObservationType

                val nextObservation = Observation.fromUpdatedReporting(
                    updatedInfractionSuspicionOrObservation,
                    currentReporting.value,
                )
                nextObservation.checkReportingActorAndFieldsRequirements()

                reportingRepository.update(reportingId, nextObservation)
            }
            ReportingType.INFRACTION_SUSPICION -> {
                currentReporting.value as InfractionSuspicionOrObservationType

                val nextInfractionSuspicion = InfractionSuspicion.fromUpdatedReporting(
                    updatedInfractionSuspicionOrObservation,
                    currentReporting.value,
                ).let {
                    getInfractionSuspicionWithDMLAndSeaFront.execute(it, currentReporting.vesselId)
                }
                nextInfractionSuspicion.checkReportingActorAndFieldsRequirements()

                reportingRepository.update(reportingId, nextInfractionSuspicion)
            }
            else -> throw IllegalArgumentException(
                "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
            )
        }
    }
}
