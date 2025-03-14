package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFleetSegmentRepository : CrudRepository<FleetSegmentEntity, Long> {
    @Modifying
    @Query(
        nativeQuery = true,
        value = """
        INSERT INTO fleet_segments (
            segment,
            segment_name,
            main_scip_species_type,
            priority,
            max_mesh,
            min_mesh,
            min_share_of_target_species,
            vessel_types,
            gears,
            fao_areas,
            target_species,
            impact_risk_factor,
            year
        ) VALUES (
            :#{#fleetSegment.segment},
            :#{#fleetSegment.segmentName},
            CAST(:#{#fleetSegment.mainScipSpeciesType} AS scip_species_type),
            :#{#fleetSegment.priority},
            :#{#fleetSegment.maxMesh},
            :#{#fleetSegment.minMesh},
            :#{#fleetSegment.minShareOfTargetSpecies},
            CAST(:#{#fleetSegment.vesselTypes} AS varchar[]),
            CAST(:#{#fleetSegment.gears} AS varchar(3)[]),
            CAST(:#{#fleetSegment.faoAreas} AS varchar(15)[]),
            CAST(:#{#fleetSegment.targetSpecies} AS varchar(3)[]),
            :#{#fleetSegment.impactRiskFactor},
            :#{#fleetSegment.year}
        )
        """,
    )
    fun saveFleetSegment(fleetSegment: FleetSegmentEntity)

    @Modifying(clearAutomatically = true)
    @Query(
        nativeQuery = true,
        value = """
        UPDATE fleet_segments SET
            segment = :#{#fleetSegment.segment},
            segment_name = :#{#fleetSegment.segmentName},
            main_scip_species_type = CAST(:#{#fleetSegment.mainScipSpeciesType} AS scip_species_type),
            priority = :#{#fleetSegment.priority},
            max_mesh = :#{#fleetSegment.maxMesh},
            min_mesh = :#{#fleetSegment.minMesh},
            min_share_of_target_species = :#{#fleetSegment.minShareOfTargetSpecies},
            vessel_types = CAST(:#{#fleetSegment.vesselTypes} AS varchar[]),
            gears = CAST(:#{#fleetSegment.gears} AS varchar(3)[]),
            fao_areas = CAST(:#{#fleetSegment.faoAreas} AS varchar(15)[]),
            target_species = CAST(:#{#fleetSegment.targetSpecies} AS varchar(3)[]),
            impact_risk_factor = :#{#fleetSegment.impactRiskFactor},
            year = :#{#fleetSegment.year}
        WHERE segment = :segment and year = :#{#fleetSegment.year}
        """,
    )
    fun updateFleetSegment(
        segment: String,
        fleetSegment: FleetSegmentEntity,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET segment_name = :segmentName WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateSegmentName(
        segment: String,
        segmentName: String,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET main_scip_species_type = CAST(:mainScipSpeciesType AS scip_species_type) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateMainScipSpeciesType(
        segment: String,
        mainScipSpeciesType: String,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET priority = :priority WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updatePriority(
        segment: String,
        priority: Double,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET max_mesh = :maxMesh WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateMaxMesh(
        segment: String,
        maxMesh: Double,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET min_mesh = :minMesh WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateMinMesh(
        segment: String,
        minMesh: Double,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET min_share_of_target_species = :minShareOfTargetSpecies WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateMinShareOfTargetSpecies(
        segment: String,
        minShareOfTargetSpecies: Double,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET vessel_types = :vesselTypes WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateVesselTypes(
        segment: String,
        vesselTypes: List<String>,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET gears = cast(:gears AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateGears(
        segment: String,
        gears: String,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET fao_areas = cast(:faoAreas AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateFAOAreas(
        segment: String,
        faoAreas: String,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET target_species = cast(:targetSpecies AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateTargetSpecies(
        segment: String,
        targetSpecies: String,
        year: Int,
    )

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET impact_risk_factor = :impactRiskFactor WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateImpactRiskFactor(
        segment: String,
        impactRiskFactor: Double,
        year: Int,
    )

    @Query
    fun findBySegmentAndYearEquals(
        segment: String,
        year: Int,
    ): FleetSegmentEntity

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM fleet_segments where segment = :segment and year = :year", nativeQuery = true)
    fun deleteBySegmentAndYearEquals(
        segment: String,
        year: Int,
    )

    @Query
    fun findAllByYearEquals(year: Int): List<FleetSegmentEntity>

    @Query(value = "SELECT DISTINCT year FROM fleet_segments ORDER BY year DESC", nativeQuery = true)
    fun findDistinctYears(): List<Int>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
    INSERT INTO fleet_segments (segment, segment_name, main_scip_species_type, priority, max_mesh, min_mesh,
        min_share_of_target_species, vessel_types, gears, fao_areas, target_species, impact_risk_factor, year)
            SELECT segment, segment_name, main_scip_species_type, priority, max_mesh, min_mesh, min_share_of_target_species,
                vessel_types, gears, fao_areas, target_species, impact_risk_factor, :nextYear
            FROM fleet_segments AS old
            WHERE old.year = :currentYear
    """,
        nativeQuery = true,
    )
    fun duplicateCurrentYearAsNextYear(
        currentYear: Int,
        nextYear: Int,
    )

    @Query(
        value = """
        SELECT DISTINCT
            unnest(gears)
        FROM
            fleet_segments
        WHERE
            year = :year AND
            (min_mesh IS NOT NULL OR max_mesh IS NOT NULL)
    """,
        nativeQuery = true,
    )
    fun findAllSegmentsGearsHavingMinOrMaxMesh(year: Int): List<String>
}
