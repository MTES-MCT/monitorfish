package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository

@UseCase
class UpdateFleetSegment(
    private val fleetSegmentRepository: FleetSegmentRepository,
) {
    @Throws(BackendUsageException::class, IllegalArgumentException::class)
    fun execute(
        segment: String,
        updatedSegment: FleetSegment,
    ): FleetSegment = fleetSegmentRepository.update(segment, updatedSegment)
}
