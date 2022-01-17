package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
@Table(name = "pending_alerts")
data class PendingAlertEntity(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Basic(optional = false)
        @Column(name = "id", unique = true, nullable = false)
        val id: Int? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "internal_reference_number", nullable = false)
        val internalReferenceNumber: String? = null,
        @Column(name = "external_reference_number", nullable = false)
        val externalReferenceNumber: String? = null,
        @Column(name = "ircs", nullable = false)
        val ircs: String? = null,
        @Column(name = "creation_date", nullable = false)
        val creationDate: ZonedDateTime,
        @Column(name = "trip_number")
        val tripNumber: Int? = null,
        @Type(type = "jsonb")
        @Column(name = "value", nullable = false, columnDefinition = "jsonb")
        val value: String) {

        fun toPendingAlert(mapper: ObjectMapper) : PendingAlert {
            return PendingAlert(
                    id = id,
                    vesselName = vesselName,
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = ircs,
                    creationDate = creationDate,
                    tripNumber = tripNumber,
                    value = mapper.readValue(value, AlertType::class.java)
            )
        }

        companion object {
                fun fromPendingAlert(alert: PendingAlert, mapper: ObjectMapper) = PendingAlertEntity(
                        vesselName = alert.vesselName,
                        internalReferenceNumber = alert.internalReferenceNumber,
                        externalReferenceNumber = alert.externalReferenceNumber,
                        ircs = alert.ircs,
                        creationDate = alert.creationDate,
                        tripNumber = alert.tripNumber,
                        value = mapper.writeValueAsString(alert.value))
        }
}
