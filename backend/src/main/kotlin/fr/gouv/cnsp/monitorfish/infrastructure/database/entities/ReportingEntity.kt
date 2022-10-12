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
    TypeDef(
        name = "pgsql_enum",
        typeClass = PostgreSQLEnumType::class
    )
)
@Table(name = "reportings")
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
    @Column(name = "internal_reference_number")
    val internalReferenceNumber: String? = null,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "vessel_identifier")
    @Enumerated(EnumType.STRING)
    @Type(type = "pgsql_enum")
    val vesselIdentifier: VesselIdentifier? = null,
    @Column(name = "creation_date", nullable = false)
    val creationDate: ZonedDateTime,
    @Column(name = "validation_date", nullable = true)
    val validationDate: ZonedDateTime? = null,
    @Type(type = "jsonb")
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
    @Column(name = "archived", nullable = false)
    val isArchived: Boolean,
    @Column(name = "deleted", nullable = false)
    val isDeleted: Boolean
) {

    fun toReporting(mapper: ObjectMapper): Reporting {
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
            value = ReportingMapper.getReportingValueFromJSON(mapper, value, type),
            isArchived = isArchived,
            isDeleted = isDeleted
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
            value = mapper.writeValueAsString(alert.value),
            isArchived = false,
            isDeleted = false
        )

        fun fromReporting(reporting: Reporting, mapper: ObjectMapper) = ReportingEntity(
            vesselName = reporting.vesselName,
            type = reporting.type,
            internalReferenceNumber = reporting.internalReferenceNumber,
            externalReferenceNumber = reporting.externalReferenceNumber,
            ircs = reporting.ircs,
            vesselIdentifier = reporting.vesselIdentifier,
            creationDate = reporting.creationDate,
            validationDate = reporting.validationDate,
            value = mapper.writeValueAsString(reporting.value),
            isArchived = false,
            isDeleted = false
        )
    }
}
