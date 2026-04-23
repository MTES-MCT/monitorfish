package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
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

        val nextReporting =
            when (currentReporting) {
                is Reporting.InfractionSuspicion -> applyCommand(currentReporting, reportingUpdateCommand)
                is Reporting.Observation -> applyCommand(currentReporting, reportingUpdateCommand)
                is Reporting.Alert -> error("unreachable")
            }

        val enrichedReporting = getReportingWithDMLAndSeaFront.execute(nextReporting)

        when (enrichedReporting) {
            is Reporting.InfractionSuspicion -> enrichedReporting.verify()
            is Reporting.Observation -> enrichedReporting.verify()
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

    private fun applyCommand(
        current: Reporting.InfractionSuspicion,
        command: ReportingUpdateCommand,
    ): Reporting =
        when (command.type) {
            ReportingType.INFRACTION_SUSPICION ->
                current.copy(
                    vesselId = command.vesselId,
                    vesselName = command.vesselName,
                    cfr = command.cfr,
                    externalMarker = command.externalMarker,
                    ircs = command.ircs,
                    mmsi = command.mmsi,
                    imo = command.imo,
                    length = command.length,
                    gearCode = command.gearCode,
                    vesselIdentifier = command.vesselIdentifier,
                    flagState = command.flagState,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    expirationDate = command.expirationDate ?: current.expirationDate,
                    reportingDate = command.reportingDate,
                    infractions = command.infractions,
                    isFishing = command.isFishing ?: false,
                    latitude = command.latitude,
                    longitude = command.longitude,
                    otherSourceType = command.otherSourceType,
                    satelliteType = command.satelliteType,
                )

            ReportingType.OBSERVATION ->
                Reporting.Observation(
                    id = current.id,
                    vesselId = command.vesselId,
                    vesselName = command.vesselName,
                    cfr = command.cfr,
                    externalMarker = command.externalMarker,
                    ircs = command.ircs,
                    mmsi = command.mmsi,
                    imo = command.imo,
                    length = command.length,
                    gearCode = command.gearCode,
                    vesselIdentifier = command.vesselIdentifier,
                    flagState = command.flagState,
                    creationDate = current.creationDate,
                    validationDate = current.validationDate,
                    expirationDate = command.expirationDate ?: current.expirationDate,
                    archivingDate = current.archivingDate,
                    isArchived = current.isArchived,
                    isDeleted = current.isDeleted,
                    latitude = command.latitude,
                    isFishing = command.isFishing ?: false,
                    longitude = command.longitude,
                    reportingDate = command.reportingDate,
                    createdBy = current.createdBy,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    lastUpdateDate = current.lastUpdateDate,
                    satelliteType = command.satelliteType,
                    otherSourceType = command.otherSourceType,
                )

            ReportingType.ALERT -> throw NotImplementedError()

            else -> error("Invalid target type")
        }

    private fun applyCommand(
        current: Reporting.Observation,
        command: ReportingUpdateCommand,
    ): Reporting =
        when (command.type) {
            ReportingType.OBSERVATION ->
                current.copy(
                    vesselId = command.vesselId,
                    vesselName = command.vesselName,
                    cfr = command.cfr,
                    externalMarker = command.externalMarker,
                    ircs = command.ircs,
                    mmsi = command.mmsi,
                    imo = command.imo,
                    length = command.length,
                    gearCode = command.gearCode,
                    vesselIdentifier = command.vesselIdentifier,
                    flagState = command.flagState,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    expirationDate = command.expirationDate ?: current.expirationDate,
                    reportingDate = command.reportingDate,
                    isFishing = command.isFishing ?: false,
                    latitude = command.latitude,
                    longitude = command.longitude,
                    otherSourceType = command.otherSourceType,
                    satelliteType = command.satelliteType,
                )

            ReportingType.INFRACTION_SUSPICION ->
                Reporting.InfractionSuspicion(
                    id = current.id,
                    vesselId = command.vesselId,
                    vesselName = command.vesselName,
                    cfr = command.cfr,
                    externalMarker = command.externalMarker,
                    ircs = command.ircs,
                    mmsi = command.mmsi,
                    imo = command.imo,
                    length = command.length,
                    gearCode = command.gearCode,
                    vesselIdentifier = command.vesselIdentifier,
                    flagState = command.flagState,
                    creationDate = current.creationDate,
                    validationDate = current.validationDate,
                    expirationDate = command.expirationDate ?: current.expirationDate,
                    archivingDate = current.archivingDate,
                    isArchived = current.isArchived,
                    isDeleted = current.isDeleted,
                    latitude = command.latitude,
                    longitude = command.longitude,
                    isFishing = command.isFishing ?: false,
                    reportingDate = command.reportingDate,
                    createdBy = current.createdBy,
                    underCharter = current.underCharter,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    infractions = command.infractions,
                    lastUpdateDate = current.lastUpdateDate,
                    satelliteType = command.satelliteType,
                    otherSourceType = command.otherSourceType,
                )

            else -> error("Invalid target type")
        }
}
