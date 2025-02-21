package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.dtos.SpeciesCatchForSegmentCalculation

/**
 * Filters the input sequence of FAO areas to keep only the smallest non overlapping areas.
 * This is useful to prune lists of FAO areas that result from intersecting a geometry (ports, vessel position...)
 * with all FAO areas.
 * In such cases we only want to keep the smallest (most precise) FAO areas in the result.
 *     Example :
 *         ['27.8.a', '27', '37.1'] will filter to ['27.8.a', '37.1']
 *
 * @see: Python implementation :
 *      https://github.com/MTES-MCT/monitorfish/blob/master/datascience/src/pipeline/helpers/fao_areas.py#L4
 */
fun removeRedundantFaoArea(faoAreas: List<FaoArea>): List<FaoArea> {
    val distinctFAOAreas = faoAreas.distinctBy { it.faoCode }

    return distinctFAOAreas
        .filter { currentFaoArea ->
            // If there is no faoCode, we do not keep this faoArea
            val anotherFaoAreaContainingCurrent =
                distinctFAOAreas
                    // We remove the currentFaoArea from the list
                    .filter { it !== currentFaoArea }
                    // We check if another faoArea starts with the currentFaoArea
                    .any { it.faoCode.startsWith(currentFaoArea.faoCode) }

            // If another faoArea contains the currentFaoArea, then we remove the currentFaoArea
            if (anotherFaoAreaContainingCurrent) {
                return@filter false
            }

            return@filter true
        }
}

/**
 * @return
 *  - true if a tested area (e.g. '27.7.b') is in a given faoArea.faoCode (e.g. '27.7.b' or '27')
 *  - false if a tested area (e.g. '27.7.b') is NOT in a given faoArea.faoCode (e.g. '28.6' or '27.7.b.4')
 *  - true if the faoArea.faoCode if null or empty
 *  - false if the faoArea.faoCode is not null or empty and the tested are is null or empty
 */
fun FaoArea.hasFaoCodeIncludedIn(faoCode: String?): Boolean {
    if (faoCode.isNullOrEmpty()) {
        return true
    }

    return this.faoCode.startsWith(faoCode)
}

fun getSpeciesCatchesForSegmentCalculation(
    faoAreas: List<String>,
    gears: List<GearControl>,
    species: List<SpeciesControl>,
    allSpecies: List<Species>,
): List<SpeciesCatchForSegmentCalculation> =
    faoAreas.flatMap { faoArea ->
        // If there is no species, we return all gears
        if (species.isEmpty()) {
            return@flatMap gears.map { gear ->
                val mesh = gear.controlledMesh ?: gear.declaredMesh

                return@map SpeciesCatchForSegmentCalculation(
                    mesh = mesh,
                    weight = 0.0,
                    gear = gear.gearCode,
                    species = null,
                    faoArea = faoArea,
                    scipSpeciesType = null,
                )
            }
        }

        return@flatMap gears.flatMap { gear ->
            species.map { specy ->
                val scipSpeciesType = allSpecies.find { it.code == specy.speciesCode }?.scipSpeciesType
                val mesh = gear.controlledMesh ?: gear.declaredMesh
                val weight = specy.controlledWeight ?: specy.declaredWeight ?: 0.0

                return@map SpeciesCatchForSegmentCalculation(
                    mesh = mesh,
                    weight = weight,
                    gear = gear.gearCode,
                    species = specy.speciesCode,
                    faoArea = faoArea,
                    scipSpeciesType = scipSpeciesType,
                )
            }
        }
    }

fun getSpeciesCatchesForSegmentCalculation(
    gearCodes: List<String>,
    catches: List<LogbookFishingCatch>,
    allSpecies: List<Species>,
): List<SpeciesCatchForSegmentCalculation> =
    gearCodes.flatMap { gearCode ->
        catches.map { specy ->
            val scipSpeciesType = allSpecies.find { it.code == specy.species }?.scipSpeciesType
            val weight = specy.weight ?: 0.0

            SpeciesCatchForSegmentCalculation(
                // TODO The mesh is not included in the manual PNO form
                mesh = null,
                weight = weight,
                gear = gearCode,
                species = specy.species,
                faoArea = specy.faoZone!!, // A FAO area is always included
                scipSpeciesType = scipSpeciesType,
            )
        }
    }
