package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

@UseCase
class CreateFleetSegment(
    private val fleetSegmentRepository: FleetSegmentRepository,
) {
    fun execute(fields: CreateOrUpdateFleetSegmentFields): FleetSegment {
        require(fields.segment != null) {
            "`segment` must be provided"
        }

        require(fields.year != null) {
            "`year` must be provided"
        }

        require(fields.priority != null) {
            "`priority` must be provided"
        }

        require(fields.vesselTypes != null) {
            "`vesselTypes` must be provided"
        }

        val newSegment =
            fields.let {
                FleetSegment(
                    segment = it.segment!!,
                    segmentName = it.segmentName ?: "",
                    gears = it.gears ?: listOf(),
                    faoAreas = it.faoAreas ?: listOf(),
                    targetSpecies = it.targetSpecies ?: listOf(),
                    impactRiskFactor = it.impactRiskFactor ?: 0.0,
                    year = it.year!!,
                    mainScipSpeciesType = fields.mainScipSpeciesType,
                    maxMesh = fields.maxMesh,
                    minMesh = fields.minMesh,
                    minShareOfTargetSpecies = fields.minShareOfTargetSpecies,
                    priority = fields.priority,
                    vesselTypes = fields.vesselTypes,
                )
            }

        return fleetSegmentRepository.save(newSegment)
    }
}
