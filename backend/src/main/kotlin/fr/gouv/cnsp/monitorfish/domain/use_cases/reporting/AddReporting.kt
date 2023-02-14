package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class AddReporting(
    private val reportingRepository: ReportingRepository,
    private val getInfractionSuspicionWithDMLAndSeaFront: GetInfractionSuspicionWithDMLAndSeaFront,
    private val getAllControlUnits: GetAllControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(AddReporting::class.java)

    fun execute(newReporting: Reporting): Pair<Reporting, ControlUnit?> {
        logger.info(
            "Adding reporting for vessel ${newReporting.internalReferenceNumber}/${newReporting.ircs}/${newReporting.externalReferenceNumber}",
        )

        require(newReporting.type != ReportingType.ALERT) {
            "The reporting type must be OBSERVATION or INFRACTION_SUSPICION"
        }

        val controlUnits = getAllControlUnits.execute()

        newReporting.value as InfractionSuspicionOrObservationType
        newReporting.value.checkReportingActorAndFieldsRequirements()

        val nextReporting = if (newReporting.type === ReportingType.INFRACTION_SUSPICION) {
            newReporting.value as InfractionSuspicion
            val nextInfractionSuspicion = getInfractionSuspicionWithDMLAndSeaFront.execute(
                newReporting.value,
                newReporting.vesselId,
            )
            newReporting.copy(value = nextInfractionSuspicion)
        } else {
            newReporting
        }

        val savedReporting = reportingRepository.save(nextReporting)
        val controlUnitId = (savedReporting.value as InfractionSuspicionOrObservationType).controlUnitId
        val controlUnit = controlUnits.find { it.id == controlUnitId }

        return Pair(savedReporting, controlUnit)
    }
}
