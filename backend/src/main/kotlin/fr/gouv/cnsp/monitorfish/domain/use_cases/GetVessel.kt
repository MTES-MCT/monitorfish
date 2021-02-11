package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

@UseCase
class GetVessel(private val vesselRepository: VesselRepository, private val positionRepository: PositionRepository) {
    suspend fun execute(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): Pair<Vessel, List<Position>> {
        return coroutineScope {
            val positionsFuture = async {
                positionRepository.findVesselLastPositions(internalReferenceNumber, externalReferenceNumber, ircs)
                        .sortedBy { it.dateTime }
            }
            val vesselFuture = async { vesselRepository.findVessel(internalReferenceNumber, externalReferenceNumber, ircs) }

            Pair(vesselFuture.await(), positionsFuture.await())
        }
    }
}
