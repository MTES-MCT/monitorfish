package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPositionAIS
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselLocation
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionAisRepository
import org.slf4j.LoggerFactory

@UseCase
class GetLastPositionsAIS(
    private val lastPositionsAisRepository: LastPositionAisRepository
) {
    private val logger = LoggerFactory.getLogger(GetLastPositionsAIS::class.java)

    fun execute(vesselLocation: VesselLocation? = null): List<LastPositionAIS> =
        when (vesselLocation) {
            VesselLocation.PORT -> lastPositionsAisRepository.findByIsAtPort(true)
            VesselLocation.SEA -> lastPositionsAisRepository.findByIsAtPort(false)
            null -> lastPositionsAisRepository.findAll()
        }
}
