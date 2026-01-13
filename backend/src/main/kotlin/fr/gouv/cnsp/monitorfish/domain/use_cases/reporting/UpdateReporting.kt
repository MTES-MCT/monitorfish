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

        // Verify current reporting is InfractionSuspicion or Observation (not Alert)
        when (currentReporting.value) {
            is ReportingContent.InfractionSuspicion, is ReportingContent.Observation -> {}
            is ReportingContent.Alert -> throw IllegalArgumentException(
                "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION",
            )
        }

        val nextReporting =
            when (updatedInfractionSuspicionOrObservation.type) {
                ReportingType.INFRACTION_SUSPICION -> {
                    val infraction = InfractionSuspicion.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    )
                    infraction.checkReportingActorAndFieldsRequirements()
                    getReportingWithDMLAndSeaFront.execute(infraction, currentReporting.vesselId)
                }
                ReportingType.OBSERVATION -> {
                    val observation = Observation.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    )
                    observation.checkReportingActorAndFieldsRequirements()
                    getReportingWithDMLAndSeaFront.execute(observation, currentReporting.vesselId)
                }
                else -> throw IllegalArgumentException(
                    "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
                )
            }

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
        val controlUnitId =
            when (val value = reporting.value) {
                is ReportingContent.InfractionSuspicion -> value.infractionSuspicion.controlUnitId
                is ReportingContent.Observation -> value.observation.controlUnitId
                is ReportingContent.Alert -> null
            }
        return controlUnits.find { it.id == controlUnitId }
    }
}
