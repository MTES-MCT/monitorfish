package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class AddReporting(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(AddReporting::class.java)

    fun execute(newReporting: Reporting): Reporting {
        logger.info("Adding reporting for vessel ${newReporting.internalReferenceNumber}/${newReporting.externalReferenceNumber}/${newReporting.ircs}")

        require(newReporting.type != ReportingType.ALERT) {
            "The reporting type must be OBSERVATION or INFRACTION_SUSPICION"
        }

        newReporting.value as InfractionSuspicionOrObservationType
        when (newReporting.value.reportingActor) {
            ReportingActor.OPS -> requireNotNull(newReporting.value.authorTrigram) {
                "An author trigram must be set"
            }
            ReportingActor.SIP -> requireNotNull(newReporting.value.authorTrigram) {
                "An author trigram must be set"
            }
            ReportingActor.UNIT -> requireNotNull(newReporting.value.unit) {
                "An unit must be set"
            }
            ReportingActor.DML -> requireNotNull(newReporting.value.authorContact) {
                "An author contact must be set"
            }
            ReportingActor.DIRM -> requireNotNull(newReporting.value.authorContact) {
                "An author contact must be set"
            }
            ReportingActor.OTHER -> requireNotNull(newReporting.value.authorContact) {
                "An author contact must be set"
            }
        }

        return reportingRepository.save(newReporting)
    }
}
