package fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea

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
            val anotherFaoAreaContainingCurrent = distinctFAOAreas
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
