package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.vladmihalcea.hibernate.type.array.ListArrayType
import com.vladmihalcea.hibernate.type.interval.PostgreSQLIntervalType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
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
@IdClass(LastPositionEntity.ReferenceCompositeKey::class)
@TypeDefs(
        TypeDef(name = "duration",
                typeClass = PostgreSQLIntervalType::class,
                defaultForType = Duration::class),
        TypeDef(name = "jsonb", typeClass = JsonBinaryType::class),
        TypeDef(name = "string-array",
                typeClass = ListArrayType::class)
)
@Table(name = "last_positions", uniqueConstraints = [UniqueConstraint(columnNames = ["cfr", "external_immatriculation"])])
data class LastPositionEntity(
        @Id
        @Column(name = "cfr")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val mmsi: String? = null,
        @Column(name = "ircs")
        val ircs: String? = null,
        @Id
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
        val registryPortLocode: String? = null,
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
        val totalWeightOnboard: Double? = null) : Serializable {

    data class ReferenceCompositeKey(val internalReferenceNumber: String? = null, val externalReferenceNumber: String? = null) : Serializable

    fun toLastPosition(mapper: ObjectMapper) = LastPosition(
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            mmsi = mmsi,
            externalReferenceNumber = externalReferenceNumber,
            dateTime = dateTime,
            latitude = latitude,
            longitude = longitude,
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
            registryPortLocode = registryPortLocode,
            district = district,
            districtCode = districtCode,
            gearOnboard = mapper.readValue(gearOnboard, mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, Gear::class.java)),
            segments = segments,
            speciesOnboard = mapper.readValue(speciesOnboard, mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, Species::class.java)),
            totalWeightOnboard = totalWeightOnboard)
}
