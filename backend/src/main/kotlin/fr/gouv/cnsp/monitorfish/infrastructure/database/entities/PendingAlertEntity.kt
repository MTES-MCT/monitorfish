package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.annotations.Type
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.ZonedDateTime

@Entity
@Table(name = "pending_alerts")
data class PendingAlertEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "internal_reference_number")
    val internalReferenceNumber: String? = null,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "vessel_id")
    val vesselId: Int? = null,
    @Column(name = "vessel_identifier", columnDefinition = "vessel_identifier")
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    val vesselIdentifier: VesselIdentifier,
    @Column(name = "flag_state")
    @Enumerated(EnumType.STRING)
    val flagState: CountryCode,
    @Column(name = "creation_date", nullable = false)
    val creationDate: ZonedDateTime,
    @Column(name = "trip_number")
    val tripNumber: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
) {

    fun toPendingAlert(mapper: ObjectMapper): PendingAlert {
        return PendingAlert(
            id = id,
            vesselName = vesselName,
            internalReferenceNumber = internalReferenceNumber,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            vesselId = vesselId,
            vesselIdentifier = vesselIdentifier,
            flagState = flagState,
            creationDate = creationDate,
            tripNumber = tripNumber,
            value = mapper.readValue(value, AlertType::class.java),
            latitude = latitude,
            longitude = longitude,
        )
    }

    companion object {
        fun fromPendingAlert(alert: PendingAlert, mapper: ObjectMapper) = PendingAlertEntity(
            vesselName = alert.vesselName,
            internalReferenceNumber = alert.internalReferenceNumber,
            externalReferenceNumber = alert.externalReferenceNumber,
            ircs = alert.ircs,
            vesselId = alert.vesselId,
            vesselIdentifier = alert.vesselIdentifier,
            flagState = alert.flagState,
            creationDate = alert.creationDate,
            tripNumber = alert.tripNumber,
            value = mapper.writeValueAsString(alert.value),
        )
    }
}
