package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields

interface FleetSegmentRepository {
    fun findAll(): List<FleetSegment>
    fun update(segment: String, fields: UpdateFleetSegmentFields): FleetSegment
}
