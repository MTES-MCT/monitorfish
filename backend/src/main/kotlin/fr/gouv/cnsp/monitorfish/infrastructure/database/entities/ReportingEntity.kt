package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CountryCodeConverter
import fr.gouv.cnsp.monitorfish.infrastructure.database.mappers.ReportingEntityFields
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
    val internalReferenceNumber: String? = null,
    @Column(name = "external_reference_number")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(name = "vessel_identifier", columnDefinition = "vessel_identifier")
    val vesselIdentifier: VesselIdentifier? = null,
    @Column(name = "flag_state")
    @Convert(converter = CountryCodeConverter::class)
    val flagState: CountryCode,
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
    @Column(name = "archiving_date_utc", nullable = true)
    val archivingDate: ZonedDateTime? = null,
    @Column(name = "deleted", nullable = false)
    val isDeleted: Boolean,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
    @Column(name = "created_by")
    val createdBy: String,
) {
    fun toReporting(mapper: ObjectMapper): Reporting =
        ReportingMapper.getReportingFromJSON(
            mapper = mapper,
            jsonValue = value,
            reportingType = type,
            entityFields =
                ReportingEntityFields(
                    id = id,
                    vesselId = vesselId,
                    vesselName = vesselName,
                    internalReferenceNumber = internalReferenceNumber,
                    externalReferenceNumber = externalReferenceNumber,
                    ircs = ircs,
                    vesselIdentifier = vesselIdentifier,
                    flagState = flagState,
                    creationDate = creationDate,
                    validationDate = validationDate,
                    expirationDate = expirationDate,
                    archivingDate = archivingDate,
                    isArchived = isArchived,
                    isDeleted = isDeleted,
                    latitude = latitude,
                    longitude = longitude,
                    createdBy = createdBy,
                ),
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
            createdBy = "SYSTEM",
        )

        fun fromReporting(
            reporting: Reporting,
            mapper: ObjectMapper,
        ) = ReportingEntity(
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
            expirationDate = reporting.expirationDate,
            value = mapper.writeValueAsString(ReportingMapper.getValueFromReporting(reporting)),
            isArchived = false,
            isDeleted = false,
            createdBy = reporting.createdBy,
        )
    }
}

/**
 * Data class for JSON serialization/deserialization of InfractionSuspicion reporting value.
 * This is used for the JSONB `value` column in the database.
 */
data class InfractionSuspicion(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: Int,
    val seaFront: String? = null,
    val dml: String? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
    @JsonProperty("type")
    val reportingTypeMapping: ReportingTypeMapping = ReportingTypeMapping.INFRACTION_SUSPICION,
)

/**
 * Data class for JSON serialization/deserialization of Observation reporting value.
 * This is used for the JSONB `value` column in the database.
 */
data class Observation(
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    val authorTrigram: String = "",
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
    @JsonProperty("type")
    val reportingTypeMapping: ReportingTypeMapping = ReportingTypeMapping.OBSERVATION,
)

enum class ReportingTypeMapping(
    private val clazz: Class<out Any>,
) : IHasImplementation {
    OBSERVATION(Observation::class.java),
    INFRACTION_SUSPICION(InfractionSuspicion::class.java),

    ;

    override fun getImplementation(): Class<out Any> = clazz
}

interface IHasImplementation {
    fun getImplementation(): Class<out Any>
}
