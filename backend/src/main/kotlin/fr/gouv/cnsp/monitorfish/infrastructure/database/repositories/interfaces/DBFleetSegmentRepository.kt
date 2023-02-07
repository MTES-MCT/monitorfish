package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFleetSegmentRepository : CrudRepository<FleetSegmentEntity, Long> {
    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET segment = :nextSegment WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateSegment(segment: String, nextSegment: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET segment_name = :segmentName WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateSegmentName(segment: String, segmentName: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET gears = cast(:gears AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateGears(segment: String, gears: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET fao_areas = cast(:faoAreas AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateFAOAreas(segment: String, faoAreas: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET target_species = cast(:targetSpecies AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateTargetSpecies(segment: String, targetSpecies: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET bycatch_species = cast(:bycatchSpecies AS varchar[]) WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateBycatchSpecies(segment: String, bycatchSpecies: String, year: Int)

    @Modifying(clearAutomatically = true)
    @Query(
        value = "UPDATE fleet_segments SET impact_risk_factor = :impactRiskFactor WHERE segment = :segment and year = :year",
        nativeQuery = true,
    )
    fun updateImpactRiskFactor(segment: String, impactRiskFactor: Double, year: Int)

    @Query
    fun findBySegmentAndYearEquals(segment: String, year: Int): FleetSegmentEntity

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM fleet_segments where segment = :segment and year = :year", nativeQuery = true)
    fun deleteBySegmentAndYearEquals(segment: String, year: Int)

    @Query
    fun findAllByYearEquals(year: Int): List<FleetSegmentEntity>

    @Query(value = "SELECT DISTINCT year FROM fleet_segments ORDER BY year DESC", nativeQuery = true)
    fun findDistinctYears(): List<Int>

    @Modifying(clearAutomatically = true)
    @Query(
        value = """
    INSERT INTO fleet_segments (segment, segment_name, dirm, gears, fao_areas, target_species, bycatch_species, impact_risk_factor, year)
        SELECT segment, segment_name, dirm, gears, fao_areas, target_species, bycatch_species, impact_risk_factor, :nextYear
        FROM fleet_segments AS old
        WHERE old.year = :currentYear
    """,
        nativeQuery = true,
    )
    fun duplicateCurrentYearAsNextYear(currentYear: Int, nextYear: Int)
}
