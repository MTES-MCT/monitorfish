package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CountryCodeConverter
import fr.gouv.cnsp.monitorfish.infrastructure.database.mappers.ReportingMapper
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.annotations.Type
import org.hibernate.dialect.PostgreSQLEnumJdbcType
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
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(name = "type", nullable = false, columnDefinition = "reporting_type")
    val type: ReportingType,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "internal_reference_number")
    val cfr: String? = null,
    @Column(name = "external_reference_number")
    val externalMarker: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "mmsi")
    val mmsi: String? = null,
    @Column(name = "imo")
    val imo: String? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(name = "vessel_identifier", columnDefinition = "vessel_identifier")
    val vesselIdentifier: VesselIdentifier? = null,
    @Column(name = "flag_state")
    @Convert(converter = CountryCodeConverter::class)
    val flagState: CountryCode,
    @Column(name = "length", nullable = true)
    val length: Double? = null,
    @Column(name = "creation_date", nullable = false)
    val creationDate: ZonedDateTime,
    @Column(name = "validation_date", nullable = true)
    val validationDate: ZonedDateTime? = null,
    @Column(name = "expiration_date", nullable = true)
    val expirationDate: ZonedDateTime? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "value", nullable = false, columnDefinition = "jsonb")
    val value: String,
    @Column(name = "archived", nullable = false)
    val isArchived: Boolean,
    @Column(name = "is_fishing", nullable = true)
    val isFishing: Boolean? = null,
    @Column(name = "gear_code", nullable = true)
    val gearCode: String? = null,
    @Column(name = "archiving_date_utc", nullable = true)
    val archivingDate: ZonedDateTime? = null,
    @Column(name = "last_update_date_utc", nullable = false)
    val lastUpdateDate: ZonedDateTime,
    @Column(name = "deleted", nullable = false)
    val isDeleted: Boolean,
    @Column(name = "is_iuu", nullable = false)
    val isIuu: Boolean = false,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
    @Column(name = "created_by")
    val createdBy: String,
    @Column(name = "reporting_date", nullable = false)
    val reportingDate: ZonedDateTime,
) {
    fun toReporting(mapper: ObjectMapper): Reporting =
        ReportingMapper.getReportingFromJSON(
            mapper = mapper,
            jsonValue = value,
            reportingType = type,
            entity = this,
        )

    companion object {
        fun fromPendingAlert(
            alert: PendingAlert,
            validationDate: ZonedDateTime?,
            mapper: ObjectMapper,
        ) = ReportingEntity(
            vesselName = alert.vesselName,
            type = ReportingType.ALERT,
            vesselId = alert.vesselId,
            cfr = alert.internalReferenceNumber,
            externalMarker = alert.externalReferenceNumber,
            ircs = alert.ircs,
            vesselIdentifier = alert.vesselIdentifier,
            flagState = alert.flagState,
            creationDate = alert.creationDate,
            validationDate = validationDate,
            value = mapper.writeValueAsString(alert.value),
            isArchived = false,
            isDeleted = false,
            isIuu = false,
            latitude = alert.latitude,
            longitude = alert.longitude,
            createdBy = "SYSTEM",
            reportingDate = ZonedDateTime.now(),
            mmsi = null,
            imo = null,
            length = null,
            expirationDate = null,
            isFishing = null,
            gearCode = null,
            archivingDate = null,
            lastUpdateDate = validationDate ?: ZonedDateTime.now(),
        )

        fun fromReporting(
            reporting: Reporting,
            mapper: ObjectMapper,
        ) = ReportingEntity(
            vesselName = reporting.vesselName,
            vesselId = reporting.vesselId,
            type = reporting.type,
            cfr = reporting.cfr,
            externalMarker = reporting.externalMarker,
            ircs = reporting.ircs,
            mmsi = reporting.mmsi,
            imo = reporting.imo,
            length = reporting.length,
            vesselIdentifier = reporting.vesselIdentifier,
            flagState = reporting.flagState,
            creationDate = reporting.creationDate,
            validationDate = reporting.validationDate,
            expirationDate = reporting.expirationDate,
            value = mapper.writeValueAsString(ReportingMapper.getValueFromReporting(reporting)),
            isArchived = false,
            isDeleted = false,
            isIuu = reporting.isIUU,
            createdBy = reporting.createdBy,
            isFishing = reporting.isFishing,
            gearCode = reporting.gearCode,
            archivingDate = reporting.archivingDate,
            lastUpdateDate = reporting.lastUpdateDate,
            latitude = reporting.latitude,
            longitude = reporting.longitude,
            reportingDate = reporting.reportingDate,
        )
    }
}
