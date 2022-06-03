package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.SilencedAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@TypeDefs(TypeDef(name = "pgsql_enum",
                typeClass = PostgreSQLEnumType::class)
)
@Table(name = "silenced_alerts")
data class SilencedAlertEntity(
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
        @Column(name = "vessel_identifier")
        @Enumerated(EnumType.STRING)
        @Type(type = "pgsql_enum")
        val vesselIdentifier: VesselIdentifier,
        @Column(name = "silenced_before_date", nullable = false)
        val silencedBeforeDate: ZonedDateTime,
        @Column(name = "silenced_after_date")
        val silencedAfterDate: ZonedDateTime? = null,
        @Type(type = "jsonb")
        @Column(name = "value", nullable = false, columnDefinition = "jsonb")
        val value: String) {

        fun toSilencedAlert(mapper: ObjectMapper) : SilencedAlert {
                return SilencedAlert(
                        id = id,
                        vesselName = vesselName,
                        internalReferenceNumber = internalReferenceNumber,
                        externalReferenceNumber = externalReferenceNumber,
                        ircs = ircs,
                        vesselIdentifier = vesselIdentifier,
                        silencedBeforeDate = silencedBeforeDate,
                        silencedAfterDate = silencedAfterDate,
                        value = mapper.readValue(value, AlertType::class.java)
                )
        }

        companion object {
                fun fromPendingAlert(mapper: ObjectMapper,
                                     alert: PendingAlert,
                                     silencedBeforeDate: ZonedDateTime,
                                     silencedAfterDate: ZonedDateTime?) = SilencedAlertEntity(
                        vesselName = alert.vesselName,
                        internalReferenceNumber = alert.internalReferenceNumber,
                        externalReferenceNumber = alert.externalReferenceNumber,
                        ircs = alert.ircs,
                        vesselIdentifier = alert.vesselIdentifier,
                        silencedBeforeDate = silencedBeforeDate,
                        silencedAfterDate = silencedAfterDate,
                        value = mapper.writeValueAsString(alert.value))
        }
}
