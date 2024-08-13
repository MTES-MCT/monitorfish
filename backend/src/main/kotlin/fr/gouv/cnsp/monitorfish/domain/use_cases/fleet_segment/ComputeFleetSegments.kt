package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import org.slf4j.LoggerFactory
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Return the computed fleet segments from the faoAreas, gears and species parameters.
 */
@UseCase
class ComputeFleetSegments(
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val clock: Clock,
) {
    private val logger = LoggerFactory.getLogger(ComputeFleetSegments::class.java)

    fun execute(
        faoAreas: List<String>,
        gearCodes: List<String>,
        specyCodes: List<String>,
    ): List<FleetSegment> {
        val currentYear = ZonedDateTime.now(clock).year
        val fleetSegments = fleetSegmentRepository.findAllByYear(currentYear)

        val computedSegments = fleetSegments.filter { fleetSegment ->
            val isContainingGearFromList =
                fleetSegment.gears.isEmpty() || fleetSegment.gears.any { gearCodes.contains(it) }
            val isContainingSpecyFromList =
                (fleetSegment.targetSpecies.isEmpty() && fleetSegment.bycatchSpecies.isEmpty()) ||
                    fleetSegment.targetSpecies.any { specyCodes.contains(it) } ||
                    fleetSegment.bycatchSpecies.any { specyCodes.contains(it) }
            val isContainingFaoAreaFromList = fleetSegment.faoAreas.isEmpty() || fleetSegment.faoAreas.any { faoArea ->
                faoAreas.map { FaoArea(it) }.any { it.hasFaoCodeIncludedIn(faoArea) }
            }

            return@filter isContainingGearFromList && isContainingSpecyFromList && isContainingFaoAreaFromList
        }

        return computedSegments
    }
}
