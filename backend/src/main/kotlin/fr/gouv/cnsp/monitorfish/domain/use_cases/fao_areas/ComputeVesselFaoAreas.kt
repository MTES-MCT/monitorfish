package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.removeRedundantFaoArea

/**
 * Return the fao areas of a given vessel
 *
 * It will try to find the fao zones from the risk factors table or
 * return computed fao zones from the given coordinates/port.
 *
 * Priority :
 * 1. Fetch the fao zones from the `risk_factors` table to have the areas of the entire voyage
 * 2. Otherwise,
 *    - Fetch the fao zones from the latitude/longitude if given
 *    - Fetch the fao zones from the portLocode if given
 */
@UseCase
class ComputeVesselFaoAreas(
    private val riskFactorRepository: RiskFactorRepository,
    private val portRepository: PortRepository,
    private val computeFaoAreasFromCoordinates: ComputeFaoAreasFromCoordinates,
) {
    fun execute(
        internalReferenceNumber: String?,
        latitude: Double?,
        longitude: Double?,
        portLocode: String?,
    ): List<String> {
        if (internalReferenceNumber == null && (latitude == null || longitude == null) && portLocode == null) {
            return listOf()
        }

        // Fetch the fao zones from the `risk_factors` table to have the areas of the entire voyage
        if (internalReferenceNumber != null) {
            // Get faoZones from speciesOnboard in risk factors table (updated by the pipeline)
            val vesselRiskFactor = riskFactorRepository.findByInternalReferenceNumber(internalReferenceNumber)
            val faoAreas =
                vesselRiskFactor
                    ?.speciesOnboard
                    // Exclude "FAR 0" catches (0 kg) so their FAO zones are not attributed to the control
                    ?.filter { specy -> (specy.weight ?: 0.0) > 0.0 }
                    ?.mapNotNull { specy -> specy.faoZone }
                    ?: listOf()

            if (faoAreas.isNotEmpty()) {
                val faoAreasObjects = faoAreas.map { FaoArea(faoCode = it) }

                return removeRedundantFaoArea(faoAreasObjects).map { it.faoCode }
            }
        }

        // Otherwise, fetch the fao zones from the latitude/longitude if given
        if (latitude != null && longitude != null) {
            return computeFaoAreasFromCoordinates.execute(longitude, latitude).map { it.faoCode }
        }

        // Otherwise, fetch the fao zones from the portLocode if given
        if (!portLocode.isNullOrEmpty()) {
            val port = portRepository.findByLocode(portLocode)

            return port.faoAreas
        }

        return listOf()
    }
}
