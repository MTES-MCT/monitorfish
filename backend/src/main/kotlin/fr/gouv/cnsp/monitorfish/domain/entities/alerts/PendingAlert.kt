package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class PendingAlert(
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
    var infraction: Infraction? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
)
