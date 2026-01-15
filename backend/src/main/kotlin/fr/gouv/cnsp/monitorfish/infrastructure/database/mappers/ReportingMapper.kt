package fr.gouv.cnsp.monitorfish.infrastructure.database.mappers

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionSuspicion
import org.springframework.stereotype.Component
import java.time.ZonedDateTime

/**
 * Common entity fields shared between all reporting types.
 */
data class ReportingEntityFields(
    val id: Int?,
    val vesselId: Int?,
    val vesselName: String?,
    val internalReferenceNumber: String?,
    val externalReferenceNumber: String?,
    val ircs: String?,
    val vesselIdentifier: VesselIdentifier?,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime?,
    val expirationDate: ZonedDateTime?,
    val archivingDate: ZonedDateTime?,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    val latitude: Double?,
    val longitude: Double?,
    val createdBy: String,
    val infraction: Infraction? = null,
    val underCharter: Boolean? = null,
)

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
        entityFields: ReportingEntityFields,
    ): Reporting =
        try {
            if (jsonValue.isNullOrEmpty() || jsonValue == jsonbNullString) {
                throw EntityConversionException("No 'Reporting' value found.")
            }

            when (reportingType) {
                ReportingType.ALERT -> {
                    val alertValue = mapper.readValue(jsonValue, Alert::class.java)
                    Reporting.Alert(
                        id = entityFields.id,
                        vesselId = entityFields.vesselId,
                        vesselName = entityFields.vesselName,
                        internalReferenceNumber = entityFields.internalReferenceNumber,
                        externalReferenceNumber = entityFields.externalReferenceNumber,
                        ircs = entityFields.ircs,
                        vesselIdentifier = entityFields.vesselIdentifier,
                        flagState = entityFields.flagState,
                        creationDate = entityFields.creationDate,
                        validationDate = entityFields.validationDate,
                        expirationDate = entityFields.expirationDate,
                        archivingDate = entityFields.archivingDate,
                        isArchived = entityFields.isArchived,
                        isDeleted = entityFields.isDeleted,
                        latitude = entityFields.latitude,
                        longitude = entityFields.longitude,
                        createdBy = entityFields.createdBy,
                        infraction = entityFields.infraction,
                        underCharter = entityFields.underCharter,
                        // Alert-specific fields from JSON value
                        alertType = alertValue.type,
                        seaFront = alertValue.seaFront,
                        dml = alertValue.dml,
                        riskFactor = alertValue.riskFactor,
                        natinfCode = alertValue.natinfCode,
                        threat = alertValue.threat,
                        threatCharacterization = alertValue.threatCharacterization,
                        alertId = alertValue.alertId,
                        name = alertValue.name,
                        alertDescription = alertValue.description,
                    )
                }

                ReportingType.INFRACTION_SUSPICION -> {
                    val infractionSuspicionValue = mapper.readValue(jsonValue, InfractionSuspicion::class.java)
                    Reporting.InfractionSuspicion(
                        id = entityFields.id,
                        vesselId = entityFields.vesselId,
                        vesselName = entityFields.vesselName,
                        internalReferenceNumber = entityFields.internalReferenceNumber,
                        externalReferenceNumber = entityFields.externalReferenceNumber,
                        ircs = entityFields.ircs,
                        vesselIdentifier = entityFields.vesselIdentifier,
                        flagState = entityFields.flagState,
                        creationDate = entityFields.creationDate,
                        validationDate = entityFields.validationDate,
                        expirationDate = entityFields.expirationDate,
                        archivingDate = entityFields.archivingDate,
                        isArchived = entityFields.isArchived,
                        isDeleted = entityFields.isDeleted,
                        latitude = entityFields.latitude,
                        longitude = entityFields.longitude,
                        createdBy = entityFields.createdBy,
                        infraction = entityFields.infraction,
                        underCharter = entityFields.underCharter,
                        // InfractionSuspicion-specific fields from JSON value
                        reportingActor = infractionSuspicionValue.reportingActor,
                        controlUnitId = infractionSuspicionValue.controlUnitId,
                        authorTrigram = infractionSuspicionValue.authorTrigram,
                        authorContact = infractionSuspicionValue.authorContact,
                        title = infractionSuspicionValue.title,
                        description = infractionSuspicionValue.description,
                        natinfCode = infractionSuspicionValue.natinfCode,
                        seaFront = infractionSuspicionValue.seaFront,
                        dml = infractionSuspicionValue.dml,
                        threat = infractionSuspicionValue.threat,
                        threatCharacterization = infractionSuspicionValue.threatCharacterization,
                    )
                }

                ReportingType.OBSERVATION -> {
                    val observationValue = mapper.readValue(jsonValue, Observation::class.java)
                    Reporting.Observation(
                        id = entityFields.id,
                        vesselId = entityFields.vesselId,
                        vesselName = entityFields.vesselName,
                        internalReferenceNumber = entityFields.internalReferenceNumber,
                        externalReferenceNumber = entityFields.externalReferenceNumber,
                        ircs = entityFields.ircs,
                        vesselIdentifier = entityFields.vesselIdentifier,
                        flagState = entityFields.flagState,
                        creationDate = entityFields.creationDate,
                        validationDate = entityFields.validationDate,
                        expirationDate = entityFields.expirationDate,
                        archivingDate = entityFields.archivingDate,
                        isArchived = entityFields.isArchived,
                        isDeleted = entityFields.isDeleted,
                        latitude = entityFields.latitude,
                        longitude = entityFields.longitude,
                        createdBy = entityFields.createdBy,
                        infraction = entityFields.infraction,
                        underCharter = entityFields.underCharter,
                        // Observation-specific fields from JSON value
                        reportingActor = observationValue.reportingActor,
                        controlUnitId = observationValue.controlUnitId,
                        authorTrigram = observationValue.authorTrigram,
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
                Alert(
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
                InfractionSuspicion(
                    reportingActor = reporting.reportingActor,
                    controlUnitId = reporting.controlUnitId,
                    authorTrigram = reporting.authorTrigram,
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
                Observation(
                    reportingActor = reporting.reportingActor,
                    controlUnitId = reporting.controlUnitId,
                    authorTrigram = reporting.authorTrigram,
                    authorContact = reporting.authorContact,
                    title = reporting.title,
                    description = reporting.description,
                    seaFront = reporting.seaFront,
                    dml = reporting.dml,
                )
        }
}
