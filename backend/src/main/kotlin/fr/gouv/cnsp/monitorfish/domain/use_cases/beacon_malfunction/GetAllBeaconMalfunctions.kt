package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction.Companion.getVesselFromBeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAllBeaconMalfunctions(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val beaconRepository: BeaconRepository,
) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconMalfunctions::class.java)

    fun execute(): List<BeaconMalfunction> {
        val lastPositions = lastPositionRepository.findAll()

        val beaconMalfunctionsExceptArchived = beaconMalfunctionsRepository.findAllExceptArchived()
        val lastSixtyArchived = beaconMalfunctionsRepository.findLastSixtyArchived()
        val activatedBeaconNumbers = beaconRepository.findActivatedBeaconNumbers()

        return (beaconMalfunctionsExceptArchived + lastSixtyArchived)
            .filter { activatedBeaconNumbers.contains(it.beaconNumber) }
            .map { beaconMalfunction ->
                val riskFactor = lastPositions.find(getVesselFromBeaconMalfunction(beaconMalfunction))?.riskFactor
                beaconMalfunction.riskFactor = riskFactor

                if (riskFactor == null) {
                    logger.warn(
                        "No risk factor for vessel ${beaconMalfunction.internalReferenceNumber} found in last positions table",
                    )
                }

                beaconMalfunction
            }
    }
}
