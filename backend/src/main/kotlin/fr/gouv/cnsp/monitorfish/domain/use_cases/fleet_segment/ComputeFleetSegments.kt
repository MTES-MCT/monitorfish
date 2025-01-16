package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.ScipSpeciesType
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos.SpeciesCatchForSegmentCalculation
import org.slf4j.LoggerFactory
import java.time.Clock
import java.time.ZonedDateTime

/**
 * Return the computed fleet segments from the species catches.
 */
@UseCase
class ComputeFleetSegments(
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val vesselRepository: VesselRepository,
    private val clock: Clock,
) {
    private val logger = LoggerFactory.getLogger(ComputeFleetSegments::class.java)

    fun execute(
        vesselId: Int,
        speciesCatches: List<SpeciesCatchForSegmentCalculation>,
    ): List<FleetSegment> {
        logger.info("Got ${speciesCatches.size} catches to assign fleet segments")

        val currentYear = ZonedDateTime.now(clock).year
        val vesselType = vesselRepository.findVesselById(vesselId)?.vesselType
        val fleetSegments = fleetSegmentRepository.findAllByYear(currentYear)

        val controlledPelagicSpeciesWeight =
            speciesCatches
                .filter { speciesCatch ->
                    speciesCatch.scipSpeciesType == ScipSpeciesType.PELAGIC
                }.sumOf { it.weight }
        val controlledDemersalSpeciesWeight =
            speciesCatches
                .filter { speciesCatch ->
                    speciesCatch.scipSpeciesType == ScipSpeciesType.DEMERSAL
                }.sumOf { it.weight }
        val totalSumOfSpeciesWeight = speciesCatches.sumOf { it.weight }

        val mainScipSpeciesType =
            if (controlledPelagicSpeciesWeight > controlledDemersalSpeciesWeight) {
                ScipSpeciesType.PELAGIC
            } else {
                ScipSpeciesType.DEMERSAL
            }

        val speciesToSegments =
            speciesCatches.map { specyCatch ->
                val computedSegment =
                    fleetSegments
                        .filter { fleetSegment ->
                            /**
                             * minShareOfTargetSpecies
                             */
                            val containsTargetSpecies =
                                speciesCatches.any { summedSpecyCatch ->
                                    fleetSegment.targetSpecies.any { it == summedSpecyCatch.species }
                                }
                            val sumOfTargetSpeciesWeight =
                                speciesCatches
                                    .filter { summedSpecyCatch ->
                                        fleetSegment.targetSpecies.any { it == summedSpecyCatch.species }
                                    }.sumOf { it.weight }
                            val shareOfTargetSpecies = sumOfTargetSpeciesWeight / totalSumOfSpeciesWeight

                            // This condition is used to add "by hand" a fleet segment to a PNO or a control,
                            // by adding a species with a 0.0 weight
                            val hasZeroWeightTargetSpecies =
                                containsTargetSpecies &&
                                    sumOfTargetSpeciesWeight == 0.0 &&
                                    fleetSegment.minShareOfTargetSpecies == 0.0

                            val hasMinShareOfTargetSpecies =
                                fleetSegment.minShareOfTargetSpecies == null ||
                                    fleetSegment.targetSpecies.isEmpty() ||
                                    shareOfTargetSpecies > fleetSegment.minShareOfTargetSpecies ||
                                    hasZeroWeightTargetSpecies

                            /**
                             * gears
                             */
                            val isContainingGearFromList =
                                fleetSegment.gears.isEmpty() ||
                                    fleetSegment.gears.any { gear -> gear == specyCatch.gear }

                            /**
                             * faoAreas
                             */
                            val isContainingFaoAreaFromList =
                                fleetSegment.faoAreas.isEmpty() ||
                                    fleetSegment.faoAreas.any { faoArea ->
                                        FaoArea(specyCatch.faoArea).hasFaoCodeIncludedIn(faoArea)
                                    }

                            /**
                             * mesh
                             */
                            val isMeshAboveMinMesh =
                                fleetSegment.minMesh == null ||
                                    (specyCatch.mesh != null && specyCatch.mesh >= fleetSegment.minMesh)
                            val isMeshBelowMaxMesh =
                                fleetSegment.maxMesh == null ||
                                    (specyCatch.mesh != null && specyCatch.mesh < fleetSegment.maxMesh)
                            val hasRightVesselType =
                                fleetSegment.vesselTypes.isEmpty() || fleetSegment.vesselTypes.any { it == vesselType }

                            val hasMainScipSpeciesType =
                                fleetSegment.mainScipSpeciesType == null ||
                                    fleetSegment.mainScipSpeciesType == mainScipSpeciesType

                            return@filter isContainingGearFromList &&
                                isContainingFaoAreaFromList &&
                                isMeshAboveMinMesh &&
                                isMeshBelowMaxMesh &&
                                hasRightVesselType &&
                                hasMainScipSpeciesType &&
                                hasMinShareOfTargetSpecies
                        }.maxByOrNull { it.priority }

                return@map Pair(specyCatch, computedSegment)
            }

        return speciesToSegments.mapNotNull { it.second }.distinct()
    }
}
