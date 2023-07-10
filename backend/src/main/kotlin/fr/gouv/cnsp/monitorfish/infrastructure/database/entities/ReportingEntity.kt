package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.mappers.ReportingMapper
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "reportings")
data class ReportingEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "vessel_id")
    val vesselId: Int? = null,
    @Enumerated(EnumType.STRING)
    @Type(PostgreSQLEnumType::class)
    @Column(name = "type", nullable = false, columnDefinition = "reporting_type")
    val type: ReportingType,
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
    val vesselIdentifier: VesselIdentifier? = null,
    @Column(name = "flag_state")
    @Enumerated(EnumType.STRING)
    val flagState: CountryCode,
    @Column(name = "creation_date", nullable = false)
    val creationDate: ZonedDateTime,
    @Column(name = "validation_date", nullable = true)
    val validationDate: ZonedDateTime? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
    @Column(name = "archived", nullable = false)
    val isArchived: Boolean,
    @Column(name = "deleted", nullable = false)
    val isDeleted: Boolean,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
) {

    fun toReporting(mapper: ObjectMapper): Reporting {
        return Reporting(
            id = id,
            vesselId = vesselId,
            type = type,
            vesselName = vesselName,
            internalReferenceNumber = internalReferenceNumber,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            vesselIdentifier = vesselIdentifier,
            flagState = flagState,
            creationDate = creationDate,
            validationDate = validationDate,
            value = ReportingMapper.getReportingValueFromJSON(mapper, value, type),
            isArchived = isArchived,
            isDeleted = isDeleted,
            latitude = latitude,
            longitude = longitude,
        )
    }

    companion object {
        fun fromPendingAlert(
            alert: PendingAlert,
            validationDate: ZonedDateTime?,
            mapper: ObjectMapper,
        ) = ReportingEntity(
            vesselName = alert.vesselName,
            type = ReportingType.ALERT,
            vesselId = alert.vesselId,
            internalReferenceNumber = alert.internalReferenceNumber,
            externalReferenceNumber = alert.externalReferenceNumber,
            ircs = alert.ircs,
            vesselIdentifier = alert.vesselIdentifier,
            flagState = alert.flagState,
            creationDate = alert.creationDate,
            validationDate = validationDate,
            value = mapper.writeValueAsString(alert.value),
            isArchived = false,
            isDeleted = false,
            latitude = alert.latitude,
            longitude = alert.longitude,
        )

        fun fromReporting(reporting: Reporting, mapper: ObjectMapper) = ReportingEntity(
            vesselName = reporting.vesselName,
            vesselId = reporting.vesselId,
            type = reporting.type,
            internalReferenceNumber = reporting.internalReferenceNumber,
            externalReferenceNumber = reporting.externalReferenceNumber,
            ircs = reporting.ircs,
            vesselIdentifier = reporting.vesselIdentifier,
            flagState = reporting.flagState,
            creationDate = reporting.creationDate,
            validationDate = reporting.validationDate,
            value = mapper.writeValueAsString(reporting.value),
            isArchived = false,
            isDeleted = false,
        )
    }
}
