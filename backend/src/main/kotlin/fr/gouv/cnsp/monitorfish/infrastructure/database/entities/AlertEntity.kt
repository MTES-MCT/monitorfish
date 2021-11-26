package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
@Table(name = "alerts")
data class AlertEntity(
        @Id
        @Column(name = "alert_id")
        val id: UUID,
        @Column(name = "name", nullable = false)
        val name: String,
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

        fun toAlert(mapper: ObjectMapper) : Alert {
            return Alert(
                    id = id,
                    name = name,
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
                fun fromAlert(alert: Alert, mapper: ObjectMapper) = AlertEntity(
                        id = alert.id,
                        name = alert.name,
                        vesselName = alert.vesselName,
                        internalReferenceNumber = alert.internalReferenceNumber,
                        externalReferenceNumber = alert.externalReferenceNumber,
                        ircs = alert.ircs,
                        creationDate = alert.creationDate,
                        tripNumber = alert.tripNumber,
                        value = mapper.writeValueAsString(alert.value))
        }
}
