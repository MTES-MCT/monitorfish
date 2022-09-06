package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
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
@Table(name = "pno_lan_alerts")
data class AlertEntity(
  @Id
  @Column(name = "alert_id")
  val id: UUID,
  @Column(name = "internal_reference_number", nullable = false)
  val internalReferenceNumber: String? = null,
  @Column(name = "external_reference_number", nullable = false)
  val externalReferenceNumber: String? = null,
  @Column(name = "ircs", nullable = false)
  val ircs: String? = null,
  @Column(name = "creation_date", nullable = false)
  val creationDate: ZonedDateTime,
  @Column(name = "trip_number")
  val tripNumber: String? = null,
  @Type(type = "jsonb")
  @Column(name = "value", nullable = false, columnDefinition = "jsonb")
  val value: String) {

  fun toAlert(mapper: ObjectMapper): PNOAndLANAlert {
    return PNOAndLANAlert(
      id = id,
      internalReferenceNumber = internalReferenceNumber,
      externalReferenceNumber = externalReferenceNumber,
      ircs = ircs,
      creationDate = creationDate,
      tripNumber = tripNumber,
      value = mapper.readValue(value, AlertType::class.java)
    )
  }

  companion object {
    fun fromAlert(alert: PNOAndLANAlert, mapper: ObjectMapper) = AlertEntity(
      id = alert.id,
      internalReferenceNumber = alert.internalReferenceNumber,
      externalReferenceNumber = alert.externalReferenceNumber,
      ircs = alert.ircs,
      creationDate = alert.creationDate,
      tripNumber = alert.tripNumber,
      value = mapper.writeValueAsString(alert.value))
  }
}
