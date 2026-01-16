package fr.gouv.cnsp.monitorfish.infrastructure.database.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.AlertValueDto
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.InfractionSuspicionDto
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.ObservationDto
import org.springframework.stereotype.Component

@Component
object ReportingMapper {
    private const val jsonbNullString = "null"

    /**
     * Deserialize JSON value and combine with entity fields to create a Reporting sealed class instance.
     */
    fun getReportingFromJSON(
        mapper: ObjectMapper,
        jsonValue: String?,
        reportingType: ReportingType,
        entity: ReportingEntity,
    ): Reporting =
        try {
            if (jsonValue.isNullOrEmpty() || jsonValue == jsonbNullString) {
                throw EntityConversionException("No 'Reporting' value found.")
            }

            when (reportingType) {
                ReportingType.ALERT -> {
                    val alertValue = mapper.readValue(jsonValue, AlertValueDto::class.java)

                    Reporting.Alert(
                        id = entity.id,
                        vesselId = entity.vesselId,
                        vesselName = entity.vesselName,
                        internalReferenceNumber = entity.internalReferenceNumber,
                        externalReferenceNumber = entity.externalReferenceNumber,
                        ircs = entity.ircs,
                        vesselIdentifier = entity.vesselIdentifier,
                        flagState = entity.flagState,
                        creationDate = entity.creationDate,
                        validationDate = entity.validationDate,
                        expirationDate = entity.expirationDate,
                        archivingDate = entity.archivingDate,
                        isArchived = entity.isArchived,
                        isDeleted = entity.isDeleted,
                        latitude = entity.latitude,
                        longitude = entity.longitude,
                        createdBy = entity.createdBy,
                        // Alert-specific fields from JSON value
                        alertType = alertValue.type,
                        seaFront = alertValue.seaFront,
                        dml = alertValue.dml,
                        riskFactor = alertValue.riskFactor,
                        natinfCode = alertValue.natinfCode ?: 0,
                        threat = alertValue.threat ?: "Famille inconnue",
                        threatCharacterization = alertValue.threatCharacterization ?: "Type inconnu",
                        alertId = alertValue.alertId,
                        name = alertValue.name,
                        alertDescription = alertValue.description,
                    )
                }

                ReportingType.INFRACTION_SUSPICION -> {
                    val infractionSuspicionValue = mapper.readValue(jsonValue, InfractionSuspicionDto::class.java)
                    Reporting.InfractionSuspicion(
                        id = entity.id,
                        vesselId = entity.vesselId,
                        vesselName = entity.vesselName,
                        internalReferenceNumber = entity.internalReferenceNumber,
                        externalReferenceNumber = entity.externalReferenceNumber,
                        ircs = entity.ircs,
                        vesselIdentifier = entity.vesselIdentifier,
                        flagState = entity.flagState,
                        creationDate = entity.creationDate,
                        validationDate = entity.validationDate,
                        expirationDate = entity.expirationDate,
                        archivingDate = entity.archivingDate,
                        isArchived = entity.isArchived,
                        isDeleted = entity.isDeleted,
                        latitude = entity.latitude,
                        longitude = entity.longitude,
                        createdBy = entity.createdBy.ifEmpty { infractionSuspicionValue.authorTrigram },
                        // InfractionSuspicion-specific fields from JSON value
                        reportingActor = infractionSuspicionValue.reportingActor,
                        controlUnitId = infractionSuspicionValue.controlUnitId,
                        authorContact = infractionSuspicionValue.authorContact,
                        title = infractionSuspicionValue.title,
                        description = infractionSuspicionValue.description,
                        natinfCode = infractionSuspicionValue.natinfCode,
                        seaFront = infractionSuspicionValue.seaFront,
                        dml = infractionSuspicionValue.dml,
                        threat = infractionSuspicionValue.threat ?: "Famille inconnue",
                        threatCharacterization = infractionSuspicionValue.threatCharacterization ?: "Type inconnu",
                    )
                }

                ReportingType.OBSERVATION -> {
                    val observationValue = mapper.readValue(jsonValue, ObservationDto::class.java)
                    Reporting.Observation(
                        id = entity.id,
                        vesselId = entity.vesselId,
                        vesselName = entity.vesselName,
                        internalReferenceNumber = entity.internalReferenceNumber,
                        externalReferenceNumber = entity.externalReferenceNumber,
                        ircs = entity.ircs,
                        vesselIdentifier = entity.vesselIdentifier,
                        flagState = entity.flagState,
                        creationDate = entity.creationDate,
                        validationDate = entity.validationDate,
                        expirationDate = entity.expirationDate,
                        archivingDate = entity.archivingDate,
                        isArchived = entity.isArchived,
                        isDeleted = entity.isDeleted,
                        latitude = entity.latitude,
                        longitude = entity.longitude,
                        createdBy = entity.createdBy.ifEmpty { observationValue.authorTrigram },
                        // Observation-specific fields from JSON value
                        reportingActor = observationValue.reportingActor,
                        controlUnitId = observationValue.controlUnitId,
                        authorContact = observationValue.authorContact,
                        title = observationValue.title,
                        description = observationValue.description,
                        seaFront = observationValue.seaFront,
                        dml = observationValue.dml,
                    )
                }
            }
        } catch (e: EntityConversionException) {
            throw e
        } catch (e: Exception) {
            throw EntityConversionException("Error while converting 'Reporting': ${e.message}", e)
        }

    /**
     * Extract the value object from a Reporting sealed class to serialize as JSON.
     */
    fun getValueFromReporting(reporting: Reporting): Any =
        when (reporting) {
            is Reporting.Alert ->
                AlertValueDto(
                    type = reporting.alertType,
                    seaFront = reporting.seaFront,
                    dml = reporting.dml,
                    riskFactor = reporting.riskFactor,
                    natinfCode = reporting.natinfCode,
                    threat = reporting.threat,
                    threatCharacterization = reporting.threatCharacterization,
                    alertId = reporting.alertId,
                    name = reporting.name,
                    description = reporting.alertDescription,
                )

            is Reporting.InfractionSuspicion ->
                InfractionSuspicionDto(
                    reportingActor = reporting.reportingActor,
                    controlUnitId = reporting.controlUnitId,
                    authorContact = reporting.authorContact,
                    title = reporting.title,
                    description = reporting.description,
                    natinfCode = reporting.natinfCode,
                    seaFront = reporting.seaFront,
                    dml = reporting.dml,
                    threat = reporting.threat,
                    threatCharacterization = reporting.threatCharacterization,
                )

            is Reporting.Observation ->
                ObservationDto(
                    reportingActor = reporting.reportingActor,
                    controlUnitId = reporting.controlUnitId,
                    authorContact = reporting.authorContact,
                    title = reporting.title,
                    description = reporting.description,
                    seaFront = reporting.seaFront,
                    dml = reporting.dml,
                )
        }
}
