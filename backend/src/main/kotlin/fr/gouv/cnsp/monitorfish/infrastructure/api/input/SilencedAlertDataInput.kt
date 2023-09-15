package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class SilencedAlertDataInput(
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier,
    val flagState: CountryCode,
    val silencedBeforeDate: ZonedDateTime,
    val value: String,
) {
    fun toSilencedAlert(objectMapper: ObjectMapper) = SilencedAlert(
        vesselId = this.vesselId,
        vesselName = this.vesselName,
        internalReferenceNumber = this.internalReferenceNumber,
        externalReferenceNumber = this.externalReferenceNumber,
        ircs = this.ircs,
        vesselIdentifier = this.vesselIdentifier,
        flagState = this.flagState,
        silencedBeforeDate = this.silencedBeforeDate,
        value = objectMapper.readValue(value, AlertType::class.java),
    )
}
