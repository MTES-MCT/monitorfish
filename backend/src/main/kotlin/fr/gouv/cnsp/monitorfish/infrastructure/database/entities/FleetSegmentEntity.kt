package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "fleet_segments")
data class FleetSegmentEntity(
    @Id
    @Column(name = "segment", nullable = false)
    val segment: String,
    @Column(name = "segment_name")
    val segmentName: String,
    @Column(name = "dirm", columnDefinition = "varchar(10)[]")
    val dirm: List<String>,
    @Column(name = "gears", columnDefinition = "varchar(3)[]")
    val gears: List<String>,
    @Column(name = "fao_areas", columnDefinition = "varchar(15)[]")
    val faoAreas: List<String>,
    @Column(name = "target_species", columnDefinition = "varchar(3)[]")
    val targetSpecies: List<String>,
    @Column(name = "bycatch_species", columnDefinition = "varchar(3)[]")
    val bycatchSpecies: List<String>,
    @Column(name = "impact_risk_factor")
    val impactRiskFactor: Double,
    @Column(name = "year", nullable = false)
    val year: Int,
) {
    fun toFleetSegment() =
        FleetSegment(
            segment = this.segment,
            segmentName = this.segmentName,
            dirm = this.dirm,
            gears = this.gears,
            faoAreas = this.faoAreas,
            targetSpecies = this.targetSpecies,
            bycatchSpecies = this.bycatchSpecies,
            impactRiskFactor = this.impactRiskFactor,
            year = this.year,
        )

    companion object {
        fun fromFleetSegment(fleetSegment: FleetSegment) =
            FleetSegmentEntity(
                segment = fleetSegment.segment,
                segmentName = fleetSegment.segmentName,
                dirm = fleetSegment.dirm,
                gears = fleetSegment.gears,
                faoAreas = fleetSegment.faoAreas,
                targetSpecies = fleetSegment.targetSpecies,
                bycatchSpecies = fleetSegment.bycatchSpecies,
                impactRiskFactor = fleetSegment.impactRiskFactor,
                year = fleetSegment.year,
            )
    }
}
