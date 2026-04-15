package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.OtherSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingSource
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.SatelliteSource
import java.time.ZonedDateTime

class DisplayedReportingDataOutput(
    val id: Int,
    val type: ReportingType,
    val vesselName: String? = null,
    val title: String,
    val description: String,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    val flagState: CountryCode,
    val reportingDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val expirationDate: ZonedDateTime? = null,
    val coordinates: List<Double> = listOf(),
    val isArchived: Boolean,
    val isInfractionSuspicion: Boolean,
    val isObservation: Boolean,
    val isIUU: Boolean,
    val featureId: String,
    val from: String,
) {
    companion object {
        const val THREE_LINES_CHARACTERS = 160

        fun fromReporting(
            reporting: Reporting,
            controlUnit: LegacyControlUnit? = null,
        ): DisplayedReportingDataOutput {
            requireNotNull(reporting.id)

            return DisplayedReportingDataOutput(
                id = reporting.id!!,
                type = reporting.type,
                coordinates =
                    if (reporting.longitude != null && reporting.latitude != null) {
                        transformCoordinatesToOpenlayersProjection(
                            longitude = reporting.longitude!!,
                            latitude = reporting.latitude!!,
                        )?.toList() ?: listOf()
                    } else {
                        listOf()
                    },
                vesselName = reporting.vesselName,
                flagState = reporting.flagState,
                reportingDate = reporting.reportingDate,
                validationDate = reporting.validationDate,
                expirationDate = reporting.expirationDate,
                isArchived = reporting.isArchived,
                isIUU = reporting.isIUU,
                featureId = "REPORTING:${reporting.id}",
                title =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> reporting.title
                        is Reporting.Observation -> reporting.title
                        is Reporting.Alert -> reporting.name
                    },
                description =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> reporting.description?.take(THREE_LINES_CHARACTERS) ?: ""
                        is Reporting.Observation -> reporting.description?.take(THREE_LINES_CHARACTERS) ?: ""
                        is Reporting.Alert -> ""
                    },
                threat =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> reporting.threat
                        is Reporting.Observation -> null
                        is Reporting.Alert -> reporting.threat
                    },
                threatCharacterization =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> reporting.threatCharacterization
                        is Reporting.Observation -> null
                        is Reporting.Alert -> reporting.threatCharacterization
                    },
                isInfractionSuspicion =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> true
                        is Reporting.Observation -> false
                        is Reporting.Alert -> true
                    },
                isObservation =
                    when (reporting) {
                        is Reporting.InfractionSuspicion -> false
                        is Reporting.Observation -> true
                        is Reporting.Alert -> false
                    },
                from = computeFrom(reporting, controlUnit),
            )
        }

        private fun computeFrom(
            reporting: Reporting,
            controlUnit: LegacyControlUnit?,
        ): String =
            when (reporting) {
                is Reporting.Alert -> "alerte"
                is Reporting.InfractionSuspicion ->
                    resolveSource(
                        reporting.reportingSource,
                        reporting.satelliteType,
                        reporting.otherSourceType,
                        controlUnit,
                    )
                is Reporting.Observation ->
                    resolveSource(
                        reporting.reportingSource,
                        reporting.satelliteType,
                        reporting.otherSourceType,
                        controlUnit,
                    )
            }

        private fun resolveSource(
            source: ReportingSource,
            satelliteType: SatelliteSource?,
            otherSourceType: OtherSource?,
            controlUnit: LegacyControlUnit?,
        ): String =
            when (source) {
                ReportingSource.OPS -> "OPS"
                ReportingSource.SIP -> "SIP"
                ReportingSource.UNIT -> controlUnit?.name ?: "Unité inconnue"
                ReportingSource.SATELLITE -> satelliteType?.label() ?: "Satellite"
                ReportingSource.OTHER -> otherSourceType?.label() ?: "Autre"
                ReportingSource.DML -> "DML"
                ReportingSource.DIRM -> "DIRM"
            }
    }
}

private fun SatelliteSource.label(): String =
    when (this) {
        SatelliteSource.COPERNICUS -> "Copernicus"
        SatelliteSource.UNSEENLABS -> "Unseelabs"
        SatelliteSource.OTHER -> "Autre"
    }

private fun OtherSource.label(): String =
    when (this) {
        OtherSource.DIRM -> "DIRM"
        OtherSource.DM -> "DM"
        OtherSource.FISHERMAN -> "Pêcheur"
        OtherSource.NGO -> "ONG ou association"
        OtherSource.BOATER -> "Plaisancier"
        OtherSource.OTHER -> "Autre"
    }
