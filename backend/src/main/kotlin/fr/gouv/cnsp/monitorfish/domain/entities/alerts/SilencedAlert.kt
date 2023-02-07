package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class SilencedAlert(
    val id: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val silencedBeforeDate: ZonedDateTime,
    val value: AlertType,
    val wasValidated: Boolean? = null,
)
