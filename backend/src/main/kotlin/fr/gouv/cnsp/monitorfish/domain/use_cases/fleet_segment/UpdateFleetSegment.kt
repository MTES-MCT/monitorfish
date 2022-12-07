package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateFleetSegmentException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

@UseCase
class UpdateFleetSegment(private val fleetSegmentRepository: FleetSegmentRepository) {
    @Throws(CouldNotUpdateFleetSegmentException::class, IllegalArgumentException::class)
    fun execute(segment: String, fields: CreateOrUpdateFleetSegmentFields, year: Int): FleetSegment {
        require(
            fields.segment != null ||
                fields.bycatchSpecies != null ||
                fields.segmentName != null ||
                fields.faoAreas != null ||
                fields.gears != null ||
                fields.impactRiskFactor != null ||
                fields.targetSpecies != null
        ) {
            "No value to update"
        }

        return fleetSegmentRepository.update(segment, fields, year)
    }
}
