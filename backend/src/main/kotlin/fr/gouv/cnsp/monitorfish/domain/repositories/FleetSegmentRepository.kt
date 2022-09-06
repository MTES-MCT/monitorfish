package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

interface FleetSegmentRepository {
  fun findAll(): List<FleetSegment>
  fun update(segment: String, fields: CreateOrUpdateFleetSegmentFields): FleetSegment
  fun delete(segment: String)
  fun create(segment: FleetSegment)
}
