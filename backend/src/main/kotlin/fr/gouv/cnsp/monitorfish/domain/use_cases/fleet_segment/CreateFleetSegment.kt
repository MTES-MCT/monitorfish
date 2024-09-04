package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

@UseCase
class CreateFleetSegment(private val fleetSegmentRepository: FleetSegmentRepository) {
    fun execute(fields: CreateOrUpdateFleetSegmentFields): FleetSegment {
        require(fields.segment != null) {
            "Segment must be provided"
        }

        require(fields.year != null) {
            "Year must be provided"
        }

        val newSegment =
            fields.let {
                FleetSegment(
                    segment = it.segment!!,
                    segmentName = it.segmentName ?: "",
                    dirm = listOf(),
                    gears = it.gears ?: listOf(),
                    faoAreas = it.faoAreas ?: listOf(),
                    targetSpecies = it.targetSpecies ?: listOf(),
                    bycatchSpecies = it.bycatchSpecies ?: listOf(),
                    impactRiskFactor = it.impactRiskFactor ?: 0.0,
                    year = it.year!!,
                )
            }

        return fleetSegmentRepository.create(newSegment)
    }
}
