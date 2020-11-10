package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

@UseCase
class GetVessel(private val vesselRepository: VesselRepository, private val positionsRepository: PositionsRepository) {

    suspend fun execute(internalReferenceNumber: String): Pair<Vessel, List<Position>> {
        return coroutineScope {
            val positions = async { positionsRepository.findVesselLastPositions(internalReferenceNumber)
                    .sortedBy { it.dateTime } }
            val vessel = async { vesselRepository.findVessel(internalReferenceNumber) }

            Pair(vessel.await(), positions.await())
        }
    }
}
