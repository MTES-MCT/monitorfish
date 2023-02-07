package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionResumeAndDetails
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconMalfunctionException

@UseCase
class ArchiveBeaconMalfunctions(
    private val updateBeaconMalfunction: UpdateBeaconMalfunction,
) {
    @Throws(CouldNotUpdateBeaconMalfunctionException::class, IllegalArgumentException::class)
    fun execute(ids: List<Int>): List<BeaconMalfunctionResumeAndDetails> {
        return ids.map {
            updateBeaconMalfunction.execute(it, null, Stage.ARCHIVED, null)
        }
    }
}
