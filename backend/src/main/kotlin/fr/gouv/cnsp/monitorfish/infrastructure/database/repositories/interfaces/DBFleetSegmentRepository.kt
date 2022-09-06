package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBFleetSegmentRepository : CrudRepository<FleetSegmentEntity, Long> {
  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET segment = :nextSegment WHERE segment = :segment", nativeQuery = true)
  fun updateSegment(segment: String, nextSegment: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET segment_name = :segmentName WHERE segment = :segment", nativeQuery = true)
  fun updateSegmentName(segment: String, segmentName: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET gears = cast(:gears AS varchar[]) WHERE segment = :segment", nativeQuery = true)
  fun updateGears(segment: String, gears: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET fao_areas = cast(:faoAreas AS varchar[]) WHERE segment = :segment", nativeQuery = true)
  fun updateFAOAreas(segment: String, faoAreas: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET target_species = cast(:targetSpecies AS varchar[]) WHERE segment = :segment", nativeQuery = true)
  fun updateTargetSpecies(segment: String, targetSpecies: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET bycatch_species = cast(:bycatchSpecies AS varchar[]) WHERE segment = :segment", nativeQuery = true)
  fun updateBycatchSpecies(segment: String, bycatchSpecies: String)

  @Modifying(clearAutomatically = true)
  @Query(value = "UPDATE fleet_segments SET impact_risk_factor = :impactRiskFactor WHERE segment = :segment", nativeQuery = true)
  fun updateImpactRiskFactor(segment: String, impactRiskFactor: Double)

  @Query
  fun findBySegmentEquals(segment: String): FleetSegmentEntity

  @Modifying(clearAutomatically = true)
  @Query
  fun deleteBySegment(segment: String)
}
