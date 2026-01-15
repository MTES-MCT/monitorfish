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
class UpdateReporting(
    private val reportingRepository: ReportingRepository,
    private val getReportingWithDMLAndSeaFront: GetReportingWithDMLAndSeaFront,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(UpdateReporting::class.java)

    fun execute(
        reportingId: Int,
        reportingUpdateCommand: ReportingUpdateCommand,
    ): Pair<Reporting, LegacyControlUnit?> {
        val currentReporting = reportingRepository.findById(reportingId)
        val controlUnits = getAllLegacyControlUnits.execute()
        logger.info("Updating reporting id $reportingId for vessel id ${currentReporting.vesselId}")

        require(currentReporting.type != ReportingType.ALERT) {
            "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION"
        }

        val nextReporting = currentReporting.update(reportingUpdateCommand)

        val enrichedReporting = getReportingWithDMLAndSeaFront.execute(nextReporting)

        when (enrichedReporting) {
            is Reporting.InfractionSuspicion -> enrichedReporting.checkReportingActorAndFieldsRequirements()
            is Reporting.Observation -> enrichedReporting.checkReportingActorAndFieldsRequirements()
            is Reporting.Alert -> {}
        }

        val updatedReporting =
            reportingRepository.update(
                reportingId = reportingId,
                updatedReporting = enrichedReporting,
            )
        val controlUnit = getControlUnit(updatedReporting, controlUnits)

        return Pair(updatedReporting, controlUnit)
    }

    fun getControlUnit(
        reporting: Reporting,
        controlUnits: List<LegacyControlUnit>,
    ): LegacyControlUnit? {
        val controlUnitId =
            when (reporting) {
                is Reporting.InfractionSuspicion -> reporting.controlUnitId
                is Reporting.Observation -> reporting.controlUnitId
                is Reporting.Alert -> null
            }
        return controlUnits.find { it.id == controlUnitId }
    }
}
