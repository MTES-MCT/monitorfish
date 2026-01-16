package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
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
    val value: AlertDataOutput,
    var infraction: InfractionDataOutput? = null,
    val alertSpecification: PositionAlertSpecificationDataOutput,
) {
    companion object {
        fun fromPendingAlert(pendingAlert: Pair<PendingAlert, PositionAlertSpecification>) =
            PendingAlertDataOutput(
                id = pendingAlert.first.id,
                vesselId = pendingAlert.first.vesselId,
                vesselName = pendingAlert.first.vesselName,
                internalReferenceNumber = pendingAlert.first.internalReferenceNumber,
                externalReferenceNumber = pendingAlert.first.externalReferenceNumber,
                ircs = pendingAlert.first.ircs,
                vesselIdentifier = pendingAlert.first.vesselIdentifier,
                flagState = pendingAlert.first.flagState,
                creationDate = pendingAlert.first.creationDate,
                tripNumber = pendingAlert.first.tripNumber,
                value = AlertDataOutput.fromAlert(pendingAlert.first.value),
                infraction = pendingAlert.first.infraction?.let { InfractionDataOutput.fromInfraction(it) },
                alertSpecification =
                    PositionAlertSpecificationDataOutput.fromPositionAlertSpecification(
                        pendingAlert.second,
                    ),
            )
    }
}
