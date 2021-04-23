package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment

interface FleetSegmentRepository {
    fun findAll() : List<FleetSegment>
}
