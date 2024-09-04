package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository

@UseCase
class DeleteFleetSegment(private val fleetSegmentRepository: FleetSegmentRepository) {
    @Throws(CouldNotDeleteException::class, IllegalArgumentException::class)
    fun execute(
        segment: String,
        year: Int,
    ): List<FleetSegment> {
        return fleetSegmentRepository.delete(segment, year)
    }
}
