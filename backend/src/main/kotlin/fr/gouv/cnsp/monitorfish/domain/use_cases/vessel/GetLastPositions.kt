package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import java.time.ZonedDateTime

/* TODO
val lastControlledFilter =
    filters.lastControlPeriod?.let(
        ::getLastControlledFilterFromLastControlPeriod,
    )
 */

/* TODO
    (
        lastControlledFilter?.lastControlledBefore?.let {
            lastPosition.lastControlDateTime?.isBefore(it)
        } ?: true
        ) &&
    (
        lastControlledFilter?.lastControlledAfter?.let {
            lastPosition.lastControlDateTime?.isAfter(it)
        } ?: true
        ) &&
 */

@UseCase
class GetLastPositions(
    private val lastPositionRepository: LastPositionRepository,
    private val vesselGroupRepository: VesselGroupRepository,
) {
    fun execute(userEmail: String): List<LastPosition> {
        val now = ZonedDateTime.now()
        val lastPositions = lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()
        val vesselGroups = vesselGroupRepository.findAllByUser(userEmail)

        return lastPositions.map { lastPosition ->
            val foundVesselGroups =
                vesselGroups.filter { vesselGroup ->
                    isInGroup(
                        vesselGroup = vesselGroup,
                        lastPosition = lastPosition,
                        now = now,
                    )
                }

            lastPosition.copy(vesselGroups = foundVesselGroups)
        }
    }

    private fun isInGroup(
        vesselGroup: VesselGroupBase,
        lastPosition: LastPosition,
        now: ZonedDateTime,
    ) = when (vesselGroup) {
        is DynamicVesselGroup -> {
            val filters = vesselGroup.filters

            val vesselsLocation = filters.vesselsLocation.singleOrNull()

            val hasCountryCodeMatch = filters.countryCodes.isEmpty() || lastPosition.flagState in filters.countryCodes

            val hasLogbookMatch =
                filters.hasLogbook?.let {
                    lastPosition.lastLogbookMessageDateTime != null
                } ?: true

            val hasRiskFactorMatch =
                filters.riskFactors.isEmpty() ||
                    filters.riskFactors.any { riskFactor ->
                        lastPosition.riskFactor in riskFactor.toDouble()..<(riskFactor + 1).toDouble()
                    }

            val vesselIsHidden =
                filters.lastPositionHoursAgo?.let { now.minusHours(it.toLong()) } ?: now
            val hasLastPositionDateTimeMatch =
                filters.lastPositionHoursAgo?.let {
                    lastPosition.dateTime.isAfter(vesselIsHidden)
                } ?: true

            val hasFleetSegmentMatch =
                filters.fleetSegments.isEmpty() ||
                    lastPosition.segments?.any { it in filters.fleetSegments } ?: true

            val hasGearMatch =
                filters.gearCodes.isEmpty() ||
                    lastPosition.gearOnboard?.any { it.gear in filters.gearCodes } ?: true

            val hasSpeciesMatch =
                filters.specyCodes.isEmpty() ||
                    lastPosition.speciesOnboard?.any { it.species in filters.specyCodes } ?: true

            val hasVesselLocationMatch =
                vesselsLocation?.let {
                    (it == VesselLocation.PORT && lastPosition.isAtPort) ||
                        (it == VesselLocation.SEA && !lastPosition.isAtPort)
                } ?: true

            val hasVesselLengthMatch =
                lastPosition.length?.let { length ->
                    filters.vesselSize?.let {
                        when (it) {
                            VesselSize.ABOVE_TWELVE_METERS -> length >= 12
                            VesselSize.BELOW_TEN_METERS -> length <= 10
                            VesselSize.BELOW_TWELVE_METERS -> length <= 12
                        }
                    } ?: true
                } ?: true

            val hasZoneMatch =
                filters.zones.takeIf { it.isNotEmpty() }?.let { zones ->
                    val point = GeometryFactory().createPoint(Coordinate(lastPosition.longitude, lastPosition.latitude))

                    return@let zones.any { zone ->
                        val polygon = GeometryFactory().createPolygon(zone.feature.coordinates)

                        return@any polygon.contains(point)
                    }
                } ?: true

            hasCountryCodeMatch &&
                hasLogbookMatch &&
                hasRiskFactorMatch &&
                hasLastPositionDateTimeMatch &&
                hasFleetSegmentMatch &&
                hasGearMatch &&
                hasSpeciesMatch &&
                hasVesselLocationMatch &&
                hasVesselLengthMatch &&
                hasZoneMatch
        }

        is FixedVesselGroup -> {
            false
        }
    }
}
