package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.mappers.ReportingMapper
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@TypeDefs(
        TypeDef(name = "jsonb", typeClass = JsonBinaryType::class),
        TypeDef(name = "pgsql_enum",
                typeClass = PostgreSQLEnumType::class))
@Table(name = "reporting")
data class ReportingEntity(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Basic(optional = false)
        @Column(name = "id", unique = true, nullable = false)
        val id: Int? = null,
        @Column(name = "type", nullable = false)
        @Enumerated(EnumType.STRING)
        @Type(type = "pgsql_enum")
        val type: ReportingType,
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
        @Column(name = "creation_date", nullable = false)
        val creationDate: ZonedDateTime,
        @Column(name = "validation_date", nullable = false)
        val validationDate: ZonedDateTime? = null,
        @Type(type = "jsonb")
        @Column(name = "value", nullable = false, columnDefinition = "jsonb")
        val value: String) {

        fun toReporting(mapper: ObjectMapper) : Reporting {
            return Reporting(
                    id = id,
                    type = type,
                    vesselName = vesselName,
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = ircs,
                    vesselIdentifier = vesselIdentifier,
                    creationDate = creationDate,
                    validationDate = validationDate,
                    value = ReportingMapper.getReportingValueFromJSON(mapper, value, type)
            )
        }

        companion object {
                fun fromPendingAlert(alert: PendingAlert, validationDate: ZonedDateTime?, mapper: ObjectMapper) = ReportingEntity(
                        vesselName = alert.vesselName,
                        type = ReportingType.ALERT,
                        internalReferenceNumber = alert.internalReferenceNumber,
                        externalReferenceNumber = alert.externalReferenceNumber,
                        ircs = alert.ircs,
                        vesselIdentifier = alert.vesselIdentifier,
                        creationDate = alert.creationDate,
                        validationDate = validationDate,
                        value = mapper.writeValueAsString(alert.value))
        }
}
