package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.vladmihalcea.hibernate.type.array.ListArrayType
import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import javax.persistence.*

@Entity
@Table(name = "fleet_segments")
@TypeDefs(TypeDef(name = "list-array", typeClass = ListArrayType::class))
data class FleetSegmentEntity(
        @Id
        @Column(name = "segment")
        val segment: String,
        @Column(name = "segment_name")
        val segmentName: String,
        @Type(type = "list-array")
        @Column(name = "dirm", columnDefinition = "varchar(10)[]")
        val dirm: List<String>,
        @Type(type = "list-array")
        @Column(name = "gears", columnDefinition = "varchar(3)[]")
        val gears: List<String>,
        @Type(type = "list-array")
        @Column(name = "fao_areas", columnDefinition = "varchar(15)[]")
        val faoAreas: List<String>,
        @Type(type = "list-array")
        @Column(name = "target_species", columnDefinition = "varchar(3)[]")
        val targetSpecies: List<String>,
        @Type(type = "list-array")
        @Column(name = "bycatch_species", columnDefinition = "varchar(3)[]")
        val bycatchSpecies: List<String>,
        @Column(name = "impact_risk_factor")
        val impactRiskFactor: Double) {

        fun toFleetSegment() = FleetSegment(
                segment = this.segment,
                segmentName = this.segmentName,
                dirm = this.dirm,
                gears = this.gears,
                faoAreas = this.faoAreas,
                targetSpecies = this.targetSpecies,
                bycatchSpecies = this.bycatchSpecies,
                impactRiskFactor = this.impactRiskFactor
    )
}
