package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetInfractionSuspicionWithDMLAndSeaFront(
    private val vesselRepository: VesselRepository,
    private val districtRepository: DistrictRepository
) {
    private val logger: Logger = LoggerFactory.getLogger(GetInfractionSuspicionWithDMLAndSeaFront::class.java)

    fun execute(infractionSuspicion: InfractionSuspicion, vesselId: Int?): InfractionSuspicion {
        vesselId?.let { _vesselId ->
            val districtCode = vesselRepository.findVessel(_vesselId)?.districtCode

            districtCode?.let {
                try {
                    val district = districtRepository.find(it)

                    return infractionSuspicion.copy(dml = district.dml, seaFront = district.facade)
                } catch (e: CodeNotFoundException) {
                    logger.warn("Could not add DML and sea front.", e)
                }
            }
        }

        logger.warn("No vessel id given, the infraction will be stored without DML/SeaFront.")

        return infractionSuspicion
    }
}
