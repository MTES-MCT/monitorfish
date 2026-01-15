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
        updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
    ): Pair<Reporting, LegacyControlUnit?> {
        val currentReporting = reportingRepository.findById(reportingId)
        val controlUnits = getAllLegacyControlUnits.execute()
        logger.info("Updating reporting id $reportingId for vessel id ${currentReporting.vesselId}")
        val expirationDate = updatedInfractionSuspicionOrObservation.expirationDate ?: currentReporting.expirationDate

        require(currentReporting.type != ReportingType.ALERT) {
            "The edited reporting must be an INFRACTION_SUSPICION or an OBSERVATION"
        }

        val nextReporting =
            when (updatedInfractionSuspicionOrObservation.type) {
                ReportingType.INFRACTION_SUSPICION -> {
                    require(updatedInfractionSuspicionOrObservation.natinfCode != null) {
                        "NATINF code should not be null"
                    }
                    require(updatedInfractionSuspicionOrObservation.threat != null) {
                        "threat should not be null"
                    }
                    require(updatedInfractionSuspicionOrObservation.threatCharacterization != null) {
                        "threatCharacterization should not be null"
                    }

                    Reporting.InfractionSuspicion(
                        id = currentReporting.id,
                        vesselId = currentReporting.vesselId,
                        vesselName = currentReporting.vesselName,
                        internalReferenceNumber = currentReporting.internalReferenceNumber,
                        externalReferenceNumber = currentReporting.externalReferenceNumber,
                        ircs = currentReporting.ircs,
                        vesselIdentifier = currentReporting.vesselIdentifier,
                        flagState = currentReporting.flagState,
                        creationDate = currentReporting.creationDate,
                        validationDate = currentReporting.validationDate,
                        expirationDate = expirationDate,
                        archivingDate = currentReporting.archivingDate,
                        isArchived = currentReporting.isArchived,
                        isDeleted = currentReporting.isDeleted,
                        latitude = currentReporting.latitude,
                        longitude = currentReporting.longitude,
                        createdBy = currentReporting.createdBy,
                        infraction = currentReporting.infraction,
                        underCharter = currentReporting.underCharter,
                        reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                        controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                        authorTrigram = "",
                        authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                        title = updatedInfractionSuspicionOrObservation.title,
                        description = updatedInfractionSuspicionOrObservation.description,
                        natinfCode = updatedInfractionSuspicionOrObservation.natinfCode,
                        threat = updatedInfractionSuspicionOrObservation.threat,
                        threatCharacterization = updatedInfractionSuspicionOrObservation.threatCharacterization,
                    )
                }
                ReportingType.OBSERVATION ->
                    Reporting.Observation(
                        id = currentReporting.id,
                        vesselId = currentReporting.vesselId,
                        vesselName = currentReporting.vesselName,
                        internalReferenceNumber = currentReporting.internalReferenceNumber,
                        externalReferenceNumber = currentReporting.externalReferenceNumber,
                        ircs = currentReporting.ircs,
                        vesselIdentifier = currentReporting.vesselIdentifier,
                        flagState = currentReporting.flagState,
                        creationDate = currentReporting.creationDate,
                        validationDate = currentReporting.validationDate,
                        expirationDate = expirationDate,
                        archivingDate = currentReporting.archivingDate,
                        isArchived = currentReporting.isArchived,
                        isDeleted = currentReporting.isDeleted,
                        latitude = currentReporting.latitude,
                        longitude = currentReporting.longitude,
                        createdBy = currentReporting.createdBy,
                        infraction = currentReporting.infraction,
                        underCharter = currentReporting.underCharter,
                        reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                        controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                        authorTrigram = "",
                        authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                        title = updatedInfractionSuspicionOrObservation.title,
                        description = updatedInfractionSuspicionOrObservation.description,
                    )
                else -> throw IllegalArgumentException(
                    "The new reporting type must be an INFRACTION_SUSPICION or an OBSERVATION",
                )
            }

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
