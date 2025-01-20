package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
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
        updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
    ): Pair<Reporting, LegacyControlUnit?> {
        val currentReporting = reportingRepository.findById(reportingId)
        val controlUnits = getAllLegacyControlUnits.execute()
        logger.info("Updating reporting id $reportingId for vessel id ${currentReporting.vesselId}")
        val expirationDate = updatedInfractionSuspicionOrObservation.expirationDate ?: currentReporting.expirationDate

        require(currentReporting.type != ReportingType.ALERT) {
            "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION"
        }

        currentReporting.value as InfractionSuspicionOrObservationType

        val nextReporting =
            when (updatedInfractionSuspicionOrObservation.type) {
                ReportingType.INFRACTION_SUSPICION ->
                    InfractionSuspicion.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    )
                ReportingType.OBSERVATION ->
                    Observation.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    )
                else -> throw IllegalArgumentException(
                    "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
                )
            }.let {
                getReportingWithDMLAndSeaFront.execute(it, currentReporting.vesselId)
            }

        nextReporting.checkReportingActorAndFieldsRequirements()

        val updatedReporting =
            when (nextReporting) {
                is InfractionSuspicion ->
                    reportingRepository.update(
                        reportingId = reportingId,
                        expirationDate = expirationDate,
                        updatedInfractionSuspicion = nextReporting,
                    )
                is Observation ->
                    reportingRepository.update(
                        reportingId = reportingId,
                        expirationDate = expirationDate,
                        updatedObservation = nextReporting,
                    )
                else -> throw IllegalArgumentException(
                    "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
                )
            }
        val controlUnit = getControlUnit(updatedReporting, controlUnits)

        return Pair(updatedReporting, controlUnit)
    }

    fun getControlUnit(
        reporting: Reporting,
        controlUnits: List<LegacyControlUnit>,
    ): LegacyControlUnit? {
        val controlUnitId = (reporting.value as InfractionSuspicionOrObservationType).controlUnitId
        return controlUnits.find { it.id == controlUnitId }
    }
}
