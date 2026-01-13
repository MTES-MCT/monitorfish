package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingContent
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class AddReporting(
    private val reportingRepository: ReportingRepository,
    private val getReportingWithDMLAndSeaFront: GetReportingWithDMLAndSeaFront,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(AddReporting::class.java)

    fun execute(newReporting: Reporting): Pair<Reporting, LegacyControlUnit?> {
        logger.info(
            "Adding reporting for vessel ${newReporting.internalReferenceNumber}/${newReporting.ircs}/${newReporting.externalReferenceNumber}",
        )

        require(newReporting.type != ReportingType.ALERT) {
            "The reporting type must be OBSERVATION or INFRACTION_SUSPICION"
        }

        val controlUnits = getAllLegacyControlUnits.execute()

        // Check reporting actor requirements
        when (val value = newReporting.value) {
            is ReportingContent.InfractionSuspicion -> value.infractionSuspicion.checkReportingActorAndFieldsRequirements()
            is ReportingContent.Observation -> value.observation.checkReportingActorAndFieldsRequirements()
            is ReportingContent.Alert -> throw IllegalArgumentException("The reporting type must be OBSERVATION or INFRACTION_SUSPICION")
        }

        // Add DML and seafront
        val nextValue =
            when (val value = newReporting.value) {
                is ReportingContent.InfractionSuspicion -> {
                    val updated = getReportingWithDMLAndSeaFront.execute(value.infractionSuspicion, newReporting.vesselId)
                    ReportingContent.InfractionSuspicion(updated)
                }
                is ReportingContent.Observation -> {
                    val updated = getReportingWithDMLAndSeaFront.execute(value.observation, newReporting.vesselId)
                    ReportingContent.Observation(updated)
                }
                is ReportingContent.Alert -> value
            }
        val nextReporting = newReporting.copy(value = nextValue)

        val savedReporting = reportingRepository.save(nextReporting)
        val controlUnitId =
            when (val value = savedReporting.value) {
                is ReportingContent.InfractionSuspicion -> value.infractionSuspicion.controlUnitId
                is ReportingContent.Observation -> value.observation.controlUnitId
                is ReportingContent.Alert -> null
            }
        val controlUnit = controlUnits.find { it.id == controlUnitId }

        return Pair(savedReporting, controlUnit)
    }
}
