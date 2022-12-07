package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository

@UseCase
class GetFleetSegmentYearEntries(private val fleetSegmentRepository: FleetSegmentRepository) {
    fun execute(): List<Int> {
        return fleetSegmentRepository.findYearEntries()
    }
}
