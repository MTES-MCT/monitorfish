package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.dtos.ReportingUpdateCommand
import java.time.ZonedDateTime

sealed class Reporting {
    abstract val id: Int?
    abstract val type: ReportingType
    abstract val vesselId: Int?
    abstract val vesselName: String?
    abstract val cfr: String?
    abstract val externalMarker: String?
    abstract val ircs: String?
    abstract val mmsi: String?
    abstract val imo: String?
    abstract val length: Double?
    abstract val gearCode: String?
    abstract val vesselIdentifier: VesselIdentifier?
    abstract val flagState: CountryCode
    abstract val creationDate: ZonedDateTime
    abstract val lastUpdateDate: ZonedDateTime
    abstract val validationDate: ZonedDateTime?
    abstract val expirationDate: ZonedDateTime?
    abstract val archivingDate: ZonedDateTime?
    abstract val isArchived: Boolean
    abstract val isDeleted: Boolean
    abstract val isIUU: Boolean
    abstract val isFishing: Boolean
    abstract val latitude: Double?
    abstract val longitude: Double?
    abstract val reportingDate: ZonedDateTime
    abstract val createdBy: String

    // Enriched in the use-case
    abstract val infraction: Infraction?

    // Enriched in the use-case
    abstract val underCharter: Boolean?

    // Common properties available on all reporting types for grouping/filtering
    abstract val seaFront: String?
    abstract val dml: String?

    fun update(command: ReportingUpdateCommand): Reporting =
        when (this) {
            is Alert ->
                throw IllegalArgumentException(
                    "Alerts cannot be updated",
                )

            is Observation -> updateFromObservation(command)

            is InfractionSuspicion -> updateFromInfractionSuspicion(command)
        }

    protected fun updateExpirationDate(newDate: ZonedDateTime?) = newDate ?: expirationDate

    data class Alert(
        override val id: Int? = null,
        override val type: ReportingType = ReportingType.ALERT,
        override val vesselId: Int? = null,
        override val vesselName: String? = null,
        override val cfr: String? = null,
        override val externalMarker: String? = null,
        override val ircs: String? = null,
        override val mmsi: String? = null,
        override val imo: String? = null,
        override val length: Double? = null,
        override val gearCode: String? = null,
        override val vesselIdentifier: VesselIdentifier? = null,
        override val flagState: CountryCode,
        override val creationDate: ZonedDateTime,
        override val lastUpdateDate: ZonedDateTime = ZonedDateTime.now(),
        override val validationDate: ZonedDateTime? = null,
        override val expirationDate: ZonedDateTime? = null,
        override val archivingDate: ZonedDateTime? = null,
        override val isFishing: Boolean = false,
        override val isArchived: Boolean,
        override val isDeleted: Boolean,
        override val isIUU: Boolean = false,
        override val latitude: Double? = null,
        override val longitude: Double? = null,
        override val reportingDate: ZonedDateTime = ZonedDateTime.now(),
        override val createdBy: String,
        override val infraction: Infraction? = null,
        override val underCharter: Boolean? = null,
        // Alert-specific fields
        val alertType: AlertType,
        override val seaFront: String? = null,
        override val dml: String? = null,
        val riskFactor: Double? = null,
        val natinfCode: Int,
        val threat: String,
        val threatCharacterization: String,
        val alertId: Int? = null,
        val name: String,
        val alertDescription: String? = null,
    ) : Reporting() {
        init {
            if (this.alertType == AlertType.POSITION_ALERT) {
                requireNotNull(alertId) {
                    "Alert id must be not null when the alert is a position"
                }
            }
        }
    }

    data class InfractionSuspicion(
        override val id: Int? = null,
        override val type: ReportingType = ReportingType.INFRACTION_SUSPICION,
        override val vesselId: Int? = null,
        override val vesselName: String? = null,
        override val cfr: String? = null,
        override val externalMarker: String? = null,
        override val ircs: String? = null,
        override val mmsi: String? = null,
        override val imo: String? = null,
        override val length: Double? = null,
        override val gearCode: String? = null,
        override val vesselIdentifier: VesselIdentifier? = null,
        override val flagState: CountryCode,
        override val creationDate: ZonedDateTime,
        override val lastUpdateDate: ZonedDateTime,
        override val validationDate: ZonedDateTime? = null,
        override val expirationDate: ZonedDateTime? = null,
        override val archivingDate: ZonedDateTime? = null,
        override val isFishing: Boolean = false,
        override val isArchived: Boolean,
        override val isDeleted: Boolean,
        override val isIUU: Boolean = false,
        override val latitude: Double? = null,
        override val longitude: Double? = null,
        override val reportingDate: ZonedDateTime,
        override val createdBy: String,
        override val infraction: Infraction? = null,
        override val underCharter: Boolean? = null,
        // InfractionSuspicion-specific fields
        val reportingSource: ReportingSource,
        val otherSourceType: OtherSource? = null,
        val controlUnitId: Int? = null,
        val authorContact: String? = null,
        val satelliteType: SatelliteSource? = null,
        val title: String,
        val description: String? = null,
        val natinfCode: Int,
        val threat: String,
        val threatCharacterization: String,
        override val seaFront: String? = null,
        override val dml: String? = null,
    ) : Reporting() {
        fun checkReportingActorAndFieldsRequirements() =
            when (reportingSource) {
                ReportingSource.UNIT ->
                    require(controlUnitId != null) {
                        "An unit must be set"
                    }
                ReportingSource.DML ->
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }
                ReportingSource.DIRM ->
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }
                ReportingSource.OTHER -> {
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }

                    require(otherSourceType != null) {
                        "An actor type must be set"
                    }
                }
                else -> {}
            }
    }

    private fun InfractionSuspicion.updateFromInfractionSuspicion(command: ReportingUpdateCommand): Reporting =
        when (command.type) {
            ReportingType.INFRACTION_SUSPICION ->
                copy(
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
                    expirationDate = updateExpirationDate(command.expirationDate),
                    reportingDate = command.reportingDate,
                    natinfCode =
                        command.natinfCode
                            ?: error("NATINF code is required"),
                    threat = command.threat ?: threat,
                    threatCharacterization = command.threatCharacterization ?: threatCharacterization,
                ).also {
                    it.checkReportingActorAndFieldsRequirements()
                }

            ReportingType.OBSERVATION ->
                Observation(
                    id = id,
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
                    creationDate = creationDate,
                    validationDate = validationDate,
                    expirationDate = updateExpirationDate(command.expirationDate),
                    archivingDate = archivingDate,
                    isArchived = isArchived,
                    isDeleted = isDeleted,
                    latitude = latitude,
                    longitude = longitude,
                    reportingDate = command.reportingDate,
                    createdBy = createdBy,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    lastUpdateDate = lastUpdateDate,
                    otherSourceType = otherSourceType,
                ).also {
                    it.checkReportingActorAndFieldsRequirements()
                }

            ReportingType.ALERT -> TODO()
            else ->
                error("Invalid target type")
        }

    data class Observation(
        override val id: Int? = null,
        override val type: ReportingType = ReportingType.OBSERVATION,
        override val vesselId: Int? = null,
        override val vesselName: String? = null,
        override val cfr: String? = null,
        override val externalMarker: String? = null,
        override val mmsi: String? = null,
        override val imo: String? = null,
        override val length: Double? = null,
        override val gearCode: String? = null,
        override val ircs: String? = null,
        override val vesselIdentifier: VesselIdentifier? = null,
        override val flagState: CountryCode,
        override val creationDate: ZonedDateTime,
        override val lastUpdateDate: ZonedDateTime,
        override val validationDate: ZonedDateTime? = null,
        override val expirationDate: ZonedDateTime? = null,
        override val archivingDate: ZonedDateTime? = null,
        override val isFishing: Boolean = false,
        override val isArchived: Boolean,
        override val isDeleted: Boolean,
        override val isIUU: Boolean = false,
        override val latitude: Double? = null,
        override val longitude: Double? = null,
        override val reportingDate: ZonedDateTime,
        override val createdBy: String,
        override val infraction: Infraction? = null,
        override val underCharter: Boolean? = null,
        // Observation-specific fields
        val reportingSource: ReportingSource,
        val otherSourceType: OtherSource? = null,
        val controlUnitId: Int? = null,
        val authorContact: String? = null,
        val satelliteType: SatelliteSource? = null,
        val title: String,
        val description: String? = null,
        override val seaFront: String? = null,
        override val dml: String? = null,
    ) : Reporting() {
        fun checkReportingActorAndFieldsRequirements() =
            when (reportingSource) {
                ReportingSource.UNIT ->
                    require(controlUnitId != null) {
                        "An unit must be set"
                    }
                ReportingSource.DML ->
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }
                ReportingSource.DIRM ->
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }
                ReportingSource.OTHER -> {
                    require(!authorContact.isNullOrEmpty()) {
                        "An author contact must be set"
                    }

                    require(otherSourceType != null) {
                        "An actor type must be set"
                    }
                }
                else -> {}
            }
    }

    private fun Observation.updateFromObservation(command: ReportingUpdateCommand): Reporting =
        when (command.type) {
            ReportingType.OBSERVATION ->
                copy(
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
                    expirationDate = updateExpirationDate(command.expirationDate),
                    reportingDate = command.reportingDate,
                ).also {
                    it.checkReportingActorAndFieldsRequirements()
                }

            ReportingType.INFRACTION_SUSPICION -> {
                requireNotNull(command.natinfCode)
                requireNotNull(command.threat)
                requireNotNull(command.threatCharacterization)

                InfractionSuspicion(
                    id = id,
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
                    creationDate = creationDate,
                    validationDate = validationDate,
                    expirationDate = updateExpirationDate(command.expirationDate),
                    archivingDate = archivingDate,
                    isArchived = isArchived,
                    isDeleted = isDeleted,
                    latitude = latitude,
                    longitude = longitude,
                    reportingDate = command.reportingDate,
                    createdBy = createdBy,
                    infraction = infraction,
                    underCharter = underCharter,
                    reportingSource = command.reportingSource,
                    controlUnitId = command.controlUnitId,
                    authorContact = command.authorContact,
                    title = command.title,
                    description = command.description,
                    natinfCode = command.natinfCode,
                    threat = command.threat,
                    threatCharacterization = command.threatCharacterization,
                    lastUpdateDate = lastUpdateDate,
                    otherSourceType = otherSourceType,
                ).also {
                    it.checkReportingActorAndFieldsRequirements()
                }
            }

            else ->
                error("Invalid target type")
        }
}
