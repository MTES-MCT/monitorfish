package fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.repositories.PortRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.removeRedundantFaoArea

/**
 * Return the fao areas of a given vessel
 *
 * It will try to find the fao zones from the risk factors table or
 * return computed fao zones from the given coordinates/port.
 *
 * Priority :
 * 1. Fetch the fao zones from the `risk_factors` table
 * 2. Otherwise,
 *    - Fetch the fao zones from the latitude/longitude if given
 *    - Fetch the fao zones from the portLocode if given
 */
@UseCase
class ComputeVesselFAOAreas(
    private val riskFactorsRepository: RiskFactorsRepository,
    private val portRepository: PortRepository,
    private val computeFAOAreasFromCoordinates: ComputeFAOAreasFromCoordinates,
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

        // Fetch the fao zones from the `risk_factors` table
        if (internalReferenceNumber != null) {
            // Get faoZones from speciesOnboard in risk factors table (updated by the pipeline)
            val vesselRiskFactor = riskFactorsRepository.findVesselRiskFactors(internalReferenceNumber)
            val faoAreas = vesselRiskFactor?.let {
                it.speciesOnboard?.let { species ->
                    species.mapNotNull { specy -> specy.faoZone }
                }
            } ?: listOf()

            if (faoAreas.isNotEmpty()) {
                val faoAreasObjects = faoAreas.map { FAOArea(faoCode = it) }

                return removeRedundantFaoArea(faoAreasObjects).map { it.faoCode }
            }

            if (latitude == null || longitude == null) {
                return listOf()
            }

            return computeFAOAreasFromCoordinates.execute(longitude, latitude).map { it.faoCode }
        }

        // Otherwise, fetch the fao zones from the latitude/longitude if given
        if (latitude != null && longitude != null) {
            return computeFAOAreasFromCoordinates.execute(longitude, latitude).map { it.faoCode }
        }

        // Otherwise, fetch the fao zones from the portLocode if given
        if (!portLocode.isNullOrEmpty()) {
            val port = portRepository.find(portLocode)

            return port.faoAreas
        }

        return listOf()
    }
}
