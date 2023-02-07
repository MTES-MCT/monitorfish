package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import java.time.ZonedDateTime
import java.util.*

class PNOAndLANAlert(
    val id: UUID,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val creationDate: ZonedDateTime,
    val tripNumber: String? = null,
    val value: AlertType,
)
