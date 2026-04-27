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

    abstract fun update(command: ReportingUpdateCommand): Reporting

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

        override fun update(command: ReportingUpdateCommand): Reporting =
            throw IllegalArgumentException("Alerts cannot be updated")
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
        var reportingSource: ReportingSource,
        var otherSourceType: OtherSource? = null,
        val controlUnitId: Int? = null,
        val authorContact: String? = null,
        val satelliteType: SatelliteSource? = null,
        val title: String,
        val description: String? = null,
        val infractions: List<InfractionSuspicionThreat>,
        val numberOfVessels: Int? = null,
        override val seaFront: String? = null,
        override val dml: String? = null,
    ) : Reporting() {
        init {
            require(infractions.isNotEmpty()) { "At least one infraction is required" }
            val (src, other) = normalizeReportingSource(reportingSource, otherSourceType)
            reportingSource = src
            otherSourceType = other
        }

        fun verify() =
            checkReportingActorAndFieldsRequirements(
                reportingSource = reportingSource,
                controlUnitId = controlUnitId,
                authorContact = authorContact,
                otherSourceType = otherSourceType,
                isIUU = isIUU,
                latitude = latitude,
                longitude = longitude,
            )

        override fun update(command: ReportingUpdateCommand): Reporting =
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
                        expirationDate = command.expirationDate ?: this.expirationDate,
                        reportingDate = command.reportingDate,
                        infractions = command.infractions,
                        numberOfVessels = command.numberOfVessels,
                        isFishing = command.isFishing ?: false,
                        latitude = command.latitude,
                        longitude = command.longitude,
                        otherSourceType = command.otherSourceType,
                        satelliteType = command.satelliteType,
                    )
                ReportingType.OBSERVATION ->
                    Observation(
                        id = this.id,
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
                        creationDate = this.creationDate,
                        lastUpdateDate = this.lastUpdateDate,
                        validationDate = this.validationDate,
                        expirationDate = command.expirationDate ?: this.expirationDate,
                        archivingDate = this.archivingDate,
                        isArchived = this.isArchived,
                        isDeleted = this.isDeleted,
                        latitude = command.latitude,
                        isFishing = command.isFishing ?: false,
                        longitude = command.longitude,
                        reportingDate = command.reportingDate,
                        createdBy = this.createdBy,
                        reportingSource = command.reportingSource,
                        controlUnitId = command.controlUnitId,
                        authorContact = command.authorContact,
                        title = command.title,
                        description = command.description,
                        satelliteType = command.satelliteType,
                        otherSourceType = command.otherSourceType,
                    )
                ReportingType.ALERT -> throw NotImplementedError()
                else -> error("Invalid target type: ${command.type}")
            }
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
        var reportingSource: ReportingSource,
        var otherSourceType: OtherSource? = null,
        val controlUnitId: Int? = null,
        val authorContact: String? = null,
        val satelliteType: SatelliteSource? = null,
        val title: String,
        val description: String? = null,
        val numberOfVessels: Int? = null,
        override val seaFront: String? = null,
        override val dml: String? = null,
    ) : Reporting() {
        init {
            val (src, other) = normalizeReportingSource(reportingSource, otherSourceType)
            reportingSource = src
            otherSourceType = other
        }

        fun verify() =
            checkReportingActorAndFieldsRequirements(
                reportingSource = reportingSource,
                controlUnitId = controlUnitId,
                authorContact = authorContact,
                otherSourceType = otherSourceType,
                isIUU = isIUU,
                latitude = latitude,
                longitude = longitude,
            )

        override fun update(command: ReportingUpdateCommand): Reporting =
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
                        expirationDate = command.expirationDate ?: this.expirationDate,
                        reportingDate = command.reportingDate,
                        isFishing = command.isFishing ?: false,
                        latitude = command.latitude,
                        longitude = command.longitude,
                        otherSourceType = command.otherSourceType,
                        satelliteType = command.satelliteType,
                        numberOfVessels = command.numberOfVessels,
                    )
                ReportingType.INFRACTION_SUSPICION ->
                    InfractionSuspicion(
                        id = this.id,
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
                        creationDate = this.creationDate,
                        lastUpdateDate = this.lastUpdateDate,
                        validationDate = this.validationDate,
                        expirationDate = command.expirationDate ?: this.expirationDate,
                        archivingDate = this.archivingDate,
                        isArchived = this.isArchived,
                        isDeleted = this.isDeleted,
                        latitude = command.latitude,
                        longitude = command.longitude,
                        isFishing = command.isFishing ?: false,
                        reportingDate = command.reportingDate,
                        createdBy = this.createdBy,
                        underCharter = this.underCharter,
                        reportingSource = command.reportingSource,
                        controlUnitId = command.controlUnitId,
                        authorContact = command.authorContact,
                        title = command.title,
                        description = command.description,
                        infractions = command.infractions,
                        satelliteType = command.satelliteType,
                        otherSourceType = command.otherSourceType,
                    )
                ReportingType.ALERT -> throw NotImplementedError()
                else -> error("Invalid target type: ${command.type}")
            }
    }
}

private fun normalizeReportingSource(
    reportingSource: ReportingSource,
    otherSourceType: OtherSource?,
): Pair<ReportingSource, OtherSource?> =
    when (reportingSource) {
        ReportingSource.DML -> ReportingSource.OTHER to OtherSource.DM
        ReportingSource.DIRM -> ReportingSource.OTHER to OtherSource.DIRM
        else -> reportingSource to otherSourceType
    }

private fun checkReportingActorAndFieldsRequirements(
    reportingSource: ReportingSource,
    controlUnitId: Int?,
    authorContact: String?,
    otherSourceType: OtherSource?,
    isIUU: Boolean,
    latitude: Double?,
    longitude: Double?,
) {
    if (isIUU) {
        require(latitude != null) { "A latitude must be set" }
        require(longitude != null) { "A longitude must be set" }
    }

    when (reportingSource) {
        ReportingSource.UNIT -> require(controlUnitId != null) { "An unit must be set" }
        ReportingSource.DML -> require(!authorContact.isNullOrEmpty()) { "An author contact must be set" }
        ReportingSource.DIRM -> require(!authorContact.isNullOrEmpty()) { "An author contact must be set" }
        ReportingSource.OTHER -> {
            require(!authorContact.isNullOrEmpty()) { "An author contact must be set" }
            require(otherSourceType != null) { "An actor type must be set" }
        }

        else -> {}
    }
}
