package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
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
    @Column(name = "main_scip_species_type", columnDefinition = "scip_species_type", nullable = true)
    val mainScipSpeciesType: String?,
    @Column(name = "priority", nullable = false)
    val priority: Double,
    @Column(name = "max_mesh", nullable = true)
    val maxMesh: Double?,
    @Column(name = "min_mesh", nullable = true)
    val minMesh: Double?,
    @Column(name = "min_share_of_target_species", nullable = true)
    val minShareOfTargetSpecies: Double?,
    @Column(name = "vessel_types", columnDefinition = "varchar(15)[]")
    val vesselTypes: List<String>?,
    @Column(name = "gears", columnDefinition = "varchar(3)[]")
    val gears: List<String>?,
    @Column(name = "fao_areas", columnDefinition = "varchar(15)[]")
    val faoAreas: List<String>?,
    @Column(name = "target_species", columnDefinition = "varchar(3)[]")
    val targetSpecies: List<String>?,
    @Column(name = "impact_risk_factor")
    val impactRiskFactor: Double,
    @Column(name = "year", nullable = false)
    val year: Int,
) {
    fun toFleetSegment() =
        FleetSegment(
            segment = this.segment,
            segmentName = this.segmentName,
            mainScipSpeciesType = this.mainScipSpeciesType?.let { ScipSpeciesType.valueOf(it) },
            maxMesh = this.maxMesh,
            minMesh = this.minMesh,
            minShareOfTargetSpecies = this.minShareOfTargetSpecies,
            priority = this.priority,
            vesselTypes = this.vesselTypes ?: listOf(),
            gears = this.gears ?: listOf(),
            faoAreas = this.faoAreas ?: listOf(),
            targetSpecies = this.targetSpecies ?: listOf(),
            impactRiskFactor = this.impactRiskFactor,
            year = this.year,
        )

    companion object {
        fun fromFleetSegment(fleetSegment: FleetSegment) =
            FleetSegmentEntity(
                segment = fleetSegment.segment,
                segmentName = fleetSegment.segmentName,
                mainScipSpeciesType = fleetSegment.mainScipSpeciesType?.name,
                maxMesh = fleetSegment.maxMesh,
                minMesh = fleetSegment.minMesh,
                minShareOfTargetSpecies = fleetSegment.minShareOfTargetSpecies,
                priority = fleetSegment.priority,
                vesselTypes = fleetSegment.vesselTypes,
                gears = fleetSegment.gears,
                faoAreas = fleetSegment.faoAreas,
                targetSpecies = fleetSegment.targetSpecies,
                impactRiskFactor = fleetSegment.impactRiskFactor,
                year = fleetSegment.year,
            )
    }
}
