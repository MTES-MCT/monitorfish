package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import java.time.ZonedDateTime

class DisplayedReportingDataOutput(
    val id: Int,
    val type: ReportingType,
    val vesselName: String? = null,
    val title: String,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val expirationDate: ZonedDateTime? = null,
    val coordinates: List<Double> = listOf(),
    val isArchived: Boolean,
    val isInfractionSuspicion: Boolean,
    val isObservation: Boolean,
    val isIUU: Boolean,
    val featureId: String,
) {
    companion object {
        fun fromReporting(reporting: Reporting): DisplayedReportingDataOutput {
            requireNotNull(reporting.id)

            return DisplayedReportingDataOutput(
                id = reporting.id!!,
                type = reporting.type,
                coordinates =
                    if (reporting.longitude != null && reporting.latitude != null) {
                        transformCoordinatesToOpenlayersProjection(
                            longitude = reporting.longitude!!,
                            latitude = reporting.latitude!!,
                        ).toList()
                    } else {
                        listOf()
                    },
                vesselName = reporting.vesselName,
                flagState = reporting.flagState,
                creationDate = reporting.creationDate,
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
            )
        }
    }
}
