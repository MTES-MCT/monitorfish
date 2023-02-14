package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class ReportingDataOutput(
    val id: Int? = null,
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val value: ReportingValueDataOutput,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    val infraction: InfractionDataOutput? = null,
    val underCharter: Boolean? = null,
) {
    companion object {
        fun fromReporting(reporting: Reporting, controlUnit: ControlUnit?): ReportingDataOutput {
            val value = when (reporting.value) {
                is InfractionSuspicion -> InfractionSuspicionDataOutput.fromInfractionSuspicion(
                    reporting.value,
                    controlUnit,
                )

                is Observation -> ObservationDataOutput.fromObservation(reporting.value, controlUnit)
                is AlertType -> AlertDataOutput.fromAlertType(reporting.value)
                else -> throw IllegalArgumentException("Should not happen.")
            }

            return ReportingDataOutput(
                id = reporting.id,
                type = reporting.type,
                vesselName = reporting.vesselName,
                vesselId = reporting.vesselId,
                internalReferenceNumber = reporting.internalReferenceNumber,
                externalReferenceNumber = reporting.externalReferenceNumber,
                ircs = reporting.ircs,
                vesselIdentifier = reporting.vesselIdentifier,
                flagState = reporting.flagState,
                creationDate = reporting.creationDate,
                validationDate = reporting.validationDate,
                value = value,
                isArchived = reporting.isArchived,
                isDeleted = reporting.isDeleted,
                infraction = reporting.infraction?.let { InfractionDataOutput.fromInfraction(it) },
                underCharter = reporting.underCharter,
            )
        }
    }
}
