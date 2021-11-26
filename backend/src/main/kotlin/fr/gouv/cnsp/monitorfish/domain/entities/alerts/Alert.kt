package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import java.time.ZonedDateTime
import java.util.*

class Alert(val id: UUID,
            val name: String,
            val vesselName: String? = null,
            val internalReferenceNumber: String? = null,
            val externalReferenceNumber: String? = null,
            val ircs: String? = null,
            val creationDate: ZonedDateTime,
            val tripNumber: Int? = null,
            val value: AlertType)
