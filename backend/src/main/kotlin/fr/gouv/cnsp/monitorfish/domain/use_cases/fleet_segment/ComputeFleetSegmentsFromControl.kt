package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.repositories.SpeciesRepository
import org.slf4j.LoggerFactory

@UseCase
class ComputeFleetSegmentsFromControl(
    private val computeFleetSegments: ComputeFleetSegments,
    private val speciesRepository: SpeciesRepository,
) {
    private val logger = LoggerFactory.getLogger(ComputeFleetSegmentsFromControl::class.java)

    fun execute(
        vesselId: Int,
        faoAreas: List<String>,
        gears: List<GearControl>,
        species: List<SpeciesControl>,
        year: Int,
    ): List<FleetSegment> {
        val allSpecies = speciesRepository.findAll()

        val speciesCatches = getSpeciesCatchesForSegmentCalculation(faoAreas, gears, species, allSpecies)

        return computeFleetSegments.execute(year, vesselId, speciesCatches)
    }
}
