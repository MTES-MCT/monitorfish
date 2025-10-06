package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class PendingAlertDataOutput(
    val id: Int? = null,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val tripNumber: String? = null,
    val value: Alert,
    var infraction: InfractionDataOutput? = null,
) {
    companion object {
        fun fromPendingAlert(pendingAlert: PendingAlert) =
            PendingAlertDataOutput(
                id = pendingAlert.id,
                vesselId = pendingAlert.vesselId,
                vesselName = pendingAlert.vesselName,
                internalReferenceNumber = pendingAlert.internalReferenceNumber,
                externalReferenceNumber = pendingAlert.externalReferenceNumber,
                ircs = pendingAlert.ircs,
                vesselIdentifier = pendingAlert.vesselIdentifier,
                flagState = pendingAlert.flagState,
                creationDate = pendingAlert.creationDate,
                tripNumber = pendingAlert.tripNumber,
                value = pendingAlert.value,
                infraction = pendingAlert.infraction?.let { InfractionDataOutput.fromInfraction(it) },
            )
    }
}
