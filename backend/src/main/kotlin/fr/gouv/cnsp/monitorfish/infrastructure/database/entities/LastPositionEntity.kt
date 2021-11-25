package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.vladmihalcea.hibernate.type.array.ListArrayType
import com.vladmihalcea.hibernate.type.interval.PostgreSQLIntervalType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.io.Serializable
import java.time.Duration
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@TypeDefs(
        TypeDef(name = "duration",
                typeClass = PostgreSQLIntervalType::class,
                defaultForType = Duration::class),
        TypeDef(name = "jsonb", typeClass = JsonBinaryType::class),
        TypeDef(name = "string-array",
                typeClass = ListArrayType::class)
)
@Table(name = "last_positions")
data class LastPositionEntity(
        @Id
        @Column(name = "id")
        val id: Int,
        @Column(name = "cfr")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val mmsi: String? = null,
        @Column(name = "ircs")
        val ircs: String? = null,
        @Column(name = "external_immatriculation")
        val externalReferenceNumber: String? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "flag_state")
        @Enumerated(EnumType.STRING)
        val flagState: CountryCode? = null,
        @Column(name = "trip_number")
        val tripNumber: Int? = null,

        @Column(name = "latitude")
        val latitude: Double? = null,
        @Column(name = "longitude")
        val longitude: Double? = null,
        @Column(name = "estimated_current_latitude")
        val estimatedCurrentLatitude: Double? = null,
        @Column(name = "estimated_current_longitude")
        val estimatedCurrentLongitude: Double? = null,
        @Column(name = "speed")
        val speed: Double? = null,
        @Column(name = "course")
        val course: Double? = null,
        @Column(name = "last_position_datetime_utc")
        val dateTime: ZonedDateTime,

        @Column(name = "emission_period")
        val emissionPeriod: Duration? = null,
        @Column(name = "last_ers_datetime_utc")
        val lastErsDateTime: ZonedDateTime? = null,
        @Column(name = "departure_datetime_utc")
        val departureDateTime: ZonedDateTime? = null,
        @Column(name = "width")
        val width: Double? = null,
        @Column(name = "length")
        val length: Double? = null,
        @Column(name = "registry_port")
        val registryPort: String? = null,
        @Column(name = "district")
        val district: String? = null,
        @Column(name = "district_code")
        val districtCode: String? = null,
        @Type(type = "jsonb")
        @Column(name = "gear_onboard", columnDefinition = "jsonb")
        val gearOnboard: String? = null,
        @Type(type = "string-array")
        @Column(name = "segments", columnDefinition = "varchar(50)[]")
        val segments: List<String>? = listOf(),
        @Type(type = "jsonb")
        @Column(name = "species_onboard", columnDefinition = "jsonb")
        val speciesOnboard: String? = null,
        @Column(name = "total_weight_onboard")
        val totalWeightOnboard: Double? = null,
        @Column(name = "last_control_datetime_utc")
        val lastControlDateTime: ZonedDateTime? = null,
        @Column(name = "last_control_infraction")
        val lastControlInfraction: Boolean? = null,
        @Column(name = "post_control_comments")
        val postControlComment: String? = null,
        @Column(name = "vessel_identifier")
        val vesselIdentifier: String? = null,
        @Column(name = "impact_risk_factor")
        val impactRiskFactor: Double? = null,
        @Column(name = "probability_risk_factor")
        val probabilityRiskFactor: Double? = null,
        @Column(name = "detectability_risk_factor")
        val detectabilityRiskFactor: Double? = null,
        @Column(name = "risk_factor")
        val riskFactor: Double? = null,
        @Column(name = "under_charter")
        val underCharter: Boolean? = null,
        @Column(name = "is_at_port")
        val isAtPort: Boolean? = null,
        @Type(type = "string-array")
        @Column(name = "alerts", columnDefinition = "varchar(200)[]")
        val alerts: List<String>? = listOf()) : Serializable {

    fun toLastPosition(mapper: ObjectMapper) = LastPosition(
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            mmsi = mmsi,
            externalReferenceNumber = externalReferenceNumber,
            dateTime = dateTime,
            latitude = latitude,
            longitude = longitude,
            estimatedCurrentLatitude = estimatedCurrentLatitude,
            estimatedCurrentLongitude = estimatedCurrentLongitude,
            vesselName = vesselName,
            speed = speed,
            course = course,
            flagState = flagState,
            tripNumber = tripNumber,
            positionType = PositionType.VMS,
            emissionPeriod = emissionPeriod,
            lastErsDateTime = lastErsDateTime,
            departureDateTime = departureDateTime,
            width = width,
            length = length,
            registryPortName = registryPort,
            district = district,
            districtCode = districtCode,
            gearOnboard = mapper.readValue(gearOnboard, mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, Gear::class.java)),
            segments = segments,
            speciesOnboard = mapper.readValue(speciesOnboard, mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, Species::class.java)),
            totalWeightOnboard = totalWeightOnboard,
            lastControlDateTime = lastControlDateTime,
            lastControlInfraction = lastControlInfraction,
            postControlComment = postControlComment,
            vesselIdentifier = vesselIdentifier,
            impactRiskFactor = impactRiskFactor,
            probabilityRiskFactor = probabilityRiskFactor,
            detectabilityRiskFactor = detectabilityRiskFactor,
            riskFactor = riskFactor,
            underCharter = underCharter,
            isAtPort = isAtPort)
}
