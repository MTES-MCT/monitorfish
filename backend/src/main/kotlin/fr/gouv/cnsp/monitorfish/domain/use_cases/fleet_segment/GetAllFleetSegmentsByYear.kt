package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository

@UseCase
class GetAllFleetSegmentsByYear(private val fleetSegmentRepository: FleetSegmentRepository) {
    fun execute(year: Int): List<FleetSegment> {
        return fleetSegmentRepository.findAllByYear(year)
    }
}
