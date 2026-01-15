package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
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

        when (newReporting) {
            is Reporting.InfractionSuspicion -> newReporting.checkReportingActorAndFieldsRequirements()
            is Reporting.Observation -> newReporting.checkReportingActorAndFieldsRequirements()
            is Reporting.Alert -> {}
        }

        val enrichedReporting = getReportingWithDMLAndSeaFront.execute(newReporting)

        val savedReporting = reportingRepository.save(enrichedReporting)
        val controlUnitId =
            when (savedReporting) {
                is Reporting.InfractionSuspicion -> savedReporting.controlUnitId
                is Reporting.Observation -> savedReporting.controlUnitId
                is Reporting.Alert -> null
            }
        val controlUnit = controlUnits.find { it.id == controlUnitId }

        return Pair(savedReporting, controlUnit)
    }
}
