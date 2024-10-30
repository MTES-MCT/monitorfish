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
    private val getInfractionSuspicionWithDMLAndSeaFront: GetInfractionSuspicionWithDMLAndSeaFront,
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

        require(currentReporting.type != ReportingType.ALERT) {
            "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION"
        }

        return when (updatedInfractionSuspicionOrObservation.type) {
            ReportingType.OBSERVATION -> {
                currentReporting.value as InfractionSuspicionOrObservationType

                val nextObservation =
                    Observation.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    )
                nextObservation.checkReportingActorAndFieldsRequirements()

                val updatedReporting = reportingRepository.update(reportingId, nextObservation)
                val controlUnit = getControlUnit(updatedReporting, controlUnits)

                Pair(updatedReporting, controlUnit)
            }

            ReportingType.INFRACTION_SUSPICION -> {
                currentReporting.value as InfractionSuspicionOrObservationType

                val nextInfractionSuspicion =
                    InfractionSuspicion.fromUpdatedReporting(
                        updatedInfractionSuspicionOrObservation,
                    ).let {
                        getInfractionSuspicionWithDMLAndSeaFront.execute(it, currentReporting.vesselId)
                    }
                nextInfractionSuspicion.checkReportingActorAndFieldsRequirements()

                val updatedReporting = reportingRepository.update(reportingId, nextInfractionSuspicion)
                val controlUnit = getControlUnit(updatedReporting, controlUnits)

                Pair(updatedReporting, controlUnit)
            }

            else -> throw IllegalArgumentException(
                "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
            )
        }
    }

    fun getControlUnit(
        reporting: Reporting,
        controlUnits: List<LegacyControlUnit>,
    ): LegacyControlUnit? {
        val controlUnitId = (reporting.value as InfractionSuspicionOrObservationType).controlUnitId
        return controlUnits.find { it.id == controlUnitId }
    }
}
