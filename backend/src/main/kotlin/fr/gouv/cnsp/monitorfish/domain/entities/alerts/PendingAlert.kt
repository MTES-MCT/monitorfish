package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import java.time.ZonedDateTime
import java.util.*

class PendingAlert(val id: Int? = null,
                   val vesselName: String? = null,
                   val internalReferenceNumber: String? = null,
                   val externalReferenceNumber: String? = null,
                   val ircs: String? = null,
                   val vesselIdentifier: VesselIdentifier,
                   val creationDate: ZonedDateTime,
                   val tripNumber: Int? = null,
                   val value: AlertType)
