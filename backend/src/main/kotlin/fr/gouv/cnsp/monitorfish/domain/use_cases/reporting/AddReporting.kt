package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
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
            ReportingActor.OPS -> require(!newReporting.value.authorTrigram.isNullOrEmpty()) {
                "An author trigram must be set"
            }
            ReportingActor.SIP -> require(!newReporting.value.authorTrigram.isNullOrEmpty()) {
                "An author trigram must be set"
            }
            ReportingActor.UNIT -> require(!newReporting.value.unit.isNullOrEmpty()) {
                "An unit must be set"
            }
            ReportingActor.DML -> require(!newReporting.value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
            ReportingActor.DIRM -> require(!newReporting.value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
            ReportingActor.OTHER -> require(!newReporting.value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
        }

      if (newReporting.type == ReportingType.INFRACTION_SUSPICION) {
        newReporting.value as InfractionSuspicion
        require(!newReporting.value.dml.isNullOrEmpty()) {
          "A DML must be set"
        }

        newReporting.value.seaFront = when (newReporting.value.dml) {
          "DML 62/80" -> Facade.MEMN.name
          "DML 76" -> Facade.MEMN.name
          "DML 76/27" -> Facade.MEMN.name
          "DML 14" -> Facade.MEMN.name
          "DML 50" -> Facade.MEMN.name
          "DML 35" -> Facade.NAMO.name
          "DML 22" -> Facade.NAMO.name
          "DML 29" -> Facade.NAMO.name
          "DML 56" -> Facade.NAMO.name
          "DML 44" -> Facade.NAMO.name
          "DML 85" -> Facade.NAMO.name
          "DML 17" -> Facade.SA.name
          "DML 33" -> Facade.SA.name
          "DML 64/40" -> Facade.SA.name
          "DML 66/11" -> Facade.MED.name
          "DML 34/30" -> Facade.MED.name
          "DML 13" -> Facade.MED.name
          "DML 83" -> Facade.MED.name
          "DML 06" -> Facade.MED.name
          "DML 2a" -> Facade.MED.name
          "DML 2b" -> Facade.MED.name
          else -> Facade.UNDEFINED.name
        }
      }

        return reportingRepository.save(newReporting)
    }
}
