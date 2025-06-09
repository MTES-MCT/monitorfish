package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAllBeaconMalfunctions(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val beaconRepository: BeaconRepository,
) {
    private val logger = LoggerFactory.getLogger(GetAllBeaconMalfunctions::class.java)

    fun execute(): List<BeaconMalfunction> {
        val riskFactors = riskFactorRepository.findAll()

        val beaconMalfunctionsExceptArchived = beaconMalfunctionsRepository.findAllExceptArchived()
        val lastSixtyArchived = beaconMalfunctionsRepository.findLastSixtyArchived()
        val activatedBeaconNumbers = beaconRepository.findActivatedBeaconNumbers()

        return (beaconMalfunctionsExceptArchived + lastSixtyArchived)
            .filter { activatedBeaconNumbers.contains(it.beaconNumber) }
            .map { beaconMalfunction ->
                val riskFactor =
                    riskFactors
                        .firstOrNull {
                            it.internalReferenceNumber ==
                                beaconMalfunction.internalReferenceNumber
                        }?.riskFactor
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
