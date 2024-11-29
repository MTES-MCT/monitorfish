package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
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

        newReporting.value as InfractionSuspicionOrObservationType
        newReporting.value.checkReportingActorAndFieldsRequirements()

        val nextValue =
            getReportingWithDMLAndSeaFront.execute(
                newReporting.value,
                newReporting.vesselId,
            )
        val nextReporting = newReporting.copy(value = nextValue)

        val savedReporting = reportingRepository.save(nextReporting)
        val controlUnitId = (savedReporting.value as InfractionSuspicionOrObservationType).controlUnitId
        val controlUnit = controlUnits.find { it.id == controlUnitId }

        return Pair(savedReporting, controlUnit)
    }
}
