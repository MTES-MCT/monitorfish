package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "silenced_alerts")
data class SilencedAlertEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true)
    val id: Int? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "internal_reference_number")
    val internalReferenceNumber: String? = null,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Enumerated(EnumType.STRING)
    @Type(PostgreSQLEnumType::class)
    @Column(name = "vessel_identifier", columnDefinition = "vessel_identifier")
    val vesselIdentifier: VesselIdentifier,
    @Column(name = "flag_state")
    @Enumerated(EnumType.STRING)
    val flagState: CountryCode,
    @Column(name = "silenced_before_date", nullable = false)
    val silencedBeforeDate: ZonedDateTime,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
    @Column(name = "was_validated")
    val wasValidated: Boolean? = null,
) {

    fun toSilencedAlert(mapper: ObjectMapper): SilencedAlert {
        return SilencedAlert(
            id = id,
            vesselName = vesselName,
            internalReferenceNumber = internalReferenceNumber,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            vesselIdentifier = vesselIdentifier,
            flagState = flagState,
            silencedBeforeDate = silencedBeforeDate,
            value = mapper.readValue(value, AlertType::class.java),
            wasValidated = wasValidated,
        )
    }

    companion object {
        fun fromPendingAlert(
            mapper: ObjectMapper,
            alert: PendingAlert,
            silencedBeforeDate: ZonedDateTime,
            isValidated: Boolean,
        ) = SilencedAlertEntity(
            vesselName = alert.vesselName,
            internalReferenceNumber = alert.internalReferenceNumber,
            externalReferenceNumber = alert.externalReferenceNumber,
            ircs = alert.ircs,
            vesselIdentifier = alert.vesselIdentifier,
            flagState = alert.flagState,
            silencedBeforeDate = silencedBeforeDate,
            value = mapper.writeValueAsString(alert.value),
            wasValidated = isValidated,
        )
    }
}
