package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeFAOAreasFromCoordinates
import org.slf4j.LoggerFactory
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Return the computed fleet segments from the given parameters.
 *
 * The port is used to get fao areas.
 * If the portLocode parameter is empty:
 *  - The fao areas will be used if not empty
 *  - Else, the fao area will be computed from the latitude/longitude
 */
@UseCase
class ComputeFleetSegments(
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val computeFAOAreasFromCoordinates: ComputeFAOAreasFromCoordinates,
    private val portRepository: PortRepository,
    private val clock: Clock,
) {
    private val logger = LoggerFactory.getLogger(ComputeFleetSegments::class.java)

    fun execute(
        faoAreas: List<String>,
        gears: List<String>,
        species: List<String>,
        latitude: Double? = null,
        longitude: Double? = null,
        portLocode: String? = null,
    ): List<FleetSegment> {
        val currentYear = ZonedDateTime.now(clock).year
        val fleetSegments = fleetSegmentRepository.findAllByYear(currentYear)

        // The port is taken for a land control (priority over the faoAreas and latitude/longitude)
        val calculatedOrGivenFaoAreas = if (!portLocode.isNullOrEmpty()) {
            val port = portRepository.find(portLocode)

            port.faoAreas.map { FAOArea(it) }
        } else {
            // We are in a sea or aerial control
            faoAreas.map { FAOArea(it) }.ifEmpty {
                // Else, we take the longitude and latitude given
                if (longitude != null && latitude != null) {
                    return@ifEmpty computeFAOAreasFromCoordinates.execute(longitude, latitude)
                }

                return@ifEmpty listOf()
            }
        }

        val computedSegments = fleetSegments.filter { fleetSegment ->
            val isContainingGearFromList = fleetSegment.gears.isEmpty() || fleetSegment.gears.any { gears.contains(it) }
            val isContainingSpecyFromList = (fleetSegment.targetSpecies.isEmpty() && fleetSegment.bycatchSpecies.isEmpty()) ||
                fleetSegment.targetSpecies.any { species.contains(it) } ||
                fleetSegment.bycatchSpecies.any { species.contains(it) }
            val isContainingFaoAreaFromList = fleetSegment.faoAreas.isEmpty() || fleetSegment.faoAreas.any { faoArea ->
                calculatedOrGivenFaoAreas.any { it.hasFaoCodeIncludedIn(faoArea) }
            }

            return@filter isContainingGearFromList && isContainingSpecyFromList && isContainingFaoAreaFromList
        }

        return computedSegments
    }
}
