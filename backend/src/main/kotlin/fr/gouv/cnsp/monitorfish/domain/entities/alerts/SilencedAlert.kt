package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class SilencedAlert(
    val id: Int? = null,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val flagState: CountryCode,
    val silencedBeforeDate: ZonedDateTime,
    val value: Alert,
    val wasValidated: Boolean? = null,
)
