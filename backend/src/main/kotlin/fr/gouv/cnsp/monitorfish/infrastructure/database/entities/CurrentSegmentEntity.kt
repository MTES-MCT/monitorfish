package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.array.ListArrayType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselCurrentSegment
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.time.ZonedDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@TypeDefs(
        TypeDef(name = "jsonb",
                typeClass = JsonBinaryType::class),
        TypeDef(name = "string-array",
                typeClass = ListArrayType::class)
)
@Table(name = "current_segments")
data class CurrentSegmentEntity(
        @Id
        @Column(name = "cfr")
        val cfr: String? = null,
        @Column(name = "last_ers_datetime_utc")
        val lastErsDatetime: ZonedDateTime? = null,
        @Column(name = "departure_datetime_utc")
        val departureDateTime: ZonedDateTime? = null,
        @Column(name = "trip_number")
        val tripNumber: Double? = null,
        @Type(type = "jsonb")
        @Column(name = "gear_onboard", columnDefinition = "jsonb")
        val gearOnboard: String?,
        @Type(type = "jsonb")
        @Column(name = "species_onboard", columnDefinition = "jsonb")
        val speciesOnboard: String?,
        @Column(name = "total_weight_onboard")
        val totalWeightOnboard: Double? = null,
        @Type(type = "string-array")
        @Column(name = "segments", columnDefinition = "varchar(50)[]")
        val segments: List<String>,
        @Type(type = "string-array")
        @Column(name = "probable_segments", columnDefinition = "varchar(50)[]")
        val probableSegments: List<String>,
        @Column(name = "segment_highest_impact")
        val segmentHighestImpact: String,
        @Column(name = "segment_highest_priority")
        val segmentHighestPriority: String,
        @Column(name = "impact_risk_factor")
        val impactRiskFactor: Double,
        @Column(name = "control_priority_level")
        val controlPriorityLevel: Double) {

        fun toCurrentSegment(mapper: ObjectMapper) : VesselCurrentSegment {
                return VesselCurrentSegment(
                        internalReferenceNumber = cfr,
                        lastErsDateTime = lastErsDatetime,
                        departureDateTime = departureDateTime,
                        tripNumber = tripNumber,
                        gearOnboard = mapper.readValue(gearOnboard, mapper.typeFactory
                                .constructCollectionType(MutableList::class.java, Gear::class.java)),
                        speciesOnboard = mapper.readValue(speciesOnboard, mapper.typeFactory
                                .constructCollectionType(MutableList::class.java, Species::class.java)),
                        totalWeightOnboard = totalWeightOnboard,
                        segments = segments,
                        probableSegments = probableSegments,
                        impactRiskFactor = impactRiskFactor,
                        controlPriorityLevel = controlPriorityLevel,
                        segmentHighestImpact = segmentHighestImpact,
                        segmentHighestPriority = segmentHighestPriority,
                )
        }
}
