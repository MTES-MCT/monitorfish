package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class ReportingDataOutput(
    val id: Int? = null,
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val cfr: String? = null,
    val externalMarker: String? = null,
    val ircs: String? = null,
    val mmsi: String? = null,
    val imo: String? = null,
    val length: Double? = null,
    val gearCode: String? = null,
    val isFishing: Boolean,
    val lastUpdateDate: ZonedDateTime,
    val latitude: Double?,
    val longitude: Double?,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val reportingDate: ZonedDateTime,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val expirationDate: ZonedDateTime? = null,
    val value: ReportingValueDataOutput,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    val infraction: InfractionDataOutput? = null,
    val underCharter: Boolean? = null,
    val createdBy: String,
) {
    companion object {
        fun fromReporting(
            reporting: Reporting,
            controlUnit: LegacyControlUnit?,
            useThreatHierarchyForForm: Boolean = false,
        ): ReportingDataOutput {
            val value =
                when (reporting) {
                    is Reporting.InfractionSuspicion ->
                        InfractionSuspicionDataOutput.fromInfractionSuspicion(
                            reporting = reporting,
                            controlUnit = controlUnit,
                            useThreatHierarchyForForm = useThreatHierarchyForForm,
                        )

                    is Reporting.Observation -> ObservationDataOutput.fromObservation(reporting, controlUnit)
                    is Reporting.Alert -> AlertDataOutput.fromReportingAlert(reporting)
                }

            return ReportingDataOutput(
                id = reporting.id,
                type = reporting.type,
                vesselName = reporting.vesselName,
                vesselId = reporting.vesselId,
                cfr = reporting.cfr,
                externalMarker = reporting.externalMarker,
                ircs = reporting.ircs,
                mmsi = reporting.mmsi,
                imo = reporting.imo,
                length = reporting.length,
                gearCode = reporting.gearCode,
                isFishing = reporting.isFishing,
                lastUpdateDate = reporting.lastUpdateDate,
                latitude = reporting.latitude,
                longitude = reporting.longitude,
                vesselIdentifier = reporting.vesselIdentifier,
                flagState = reporting.flagState,
                reportingDate = reporting.reportingDate,
                creationDate = reporting.creationDate,
                validationDate = reporting.validationDate,
                expirationDate = reporting.expirationDate,
                value = value,
                isArchived = reporting.isArchived,
                isDeleted = reporting.isDeleted,
                infraction = reporting.infraction?.let { InfractionDataOutput.fromInfraction(it) },
                underCharter = reporting.underCharter,
                createdBy = reporting.createdBy.substringBefore('@'),
            )
        }
    }
}
