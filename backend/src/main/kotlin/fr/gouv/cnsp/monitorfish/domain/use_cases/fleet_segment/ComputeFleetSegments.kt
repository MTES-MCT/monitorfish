package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FAOAreasRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Return the computed fleet segments from the given parameters.
 *
 * If the faoAreas parameter is empty:
 *  - The port fao areas will be fetched if the port is given
 *  - Else, the fao area will be computed from the latitude/longitude
 */
@UseCase
class ComputeFleetSegments(
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val faoAreasRepository: FAOAreasRepository,
    private val portRepository: PortRepository,
    private val clock: Clock,
) {
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

        val calculatedOrGivenFaoAreas = faoAreas.map { FAOArea(it) }.ifEmpty {
            // When the port is given
            if (!portLocode.isNullOrEmpty()) {
                val port = portRepository.find(portLocode)

                return@ifEmpty port.faoAreas.map { FAOArea(it) }
            }

            // Else, we take the longitude and latitude given
            require(longitude != null && latitude != null) {
                "A port Locode or the control coordinates must be given"
            }

            val point = GeometryFactory().createPoint(Coordinate(longitude, latitude))
            val allFaoAreas = faoAreasRepository.findByIncluding(point)

            return@ifEmpty removeRedundantFaoArea(allFaoAreas)
        }

        val computedSegments = fleetSegments.filter { fleetSegment ->
            val isContainingGearFromList = fleetSegment.gears.any { gears.contains(it) }
            val isContainingSpecyFromList = fleetSegment.targetSpecies.any { species.contains(it) }
            val isContainingFaoAreaFromList = fleetSegment.faoAreas.any { faoArea ->
                calculatedOrGivenFaoAreas.any { it.hasFaoCodeIncludedIn(faoArea) }
            }

            return@filter isContainingGearFromList && isContainingSpecyFromList && isContainingFaoAreaFromList
        }

        return computedSegments
    }
}
