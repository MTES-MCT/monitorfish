package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetReportingWithDMLAndSeaFront(
    private val vesselRepository: VesselRepository,
    private val districtRepository: DistrictRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetReportingWithDMLAndSeaFront::class.java)

    fun execute(
        infractionSuspicionOrObservationType: InfractionSuspicionOrObservationType,
        vesselId: Int?,
    ): InfractionSuspicionOrObservationType {
        vesselId?.let { vesselIdNotNull ->
            val districtCode = vesselRepository.findVesselById(vesselIdNotNull)?.districtCode

            districtCode?.let {
                try {
                    val district = districtRepository.find(it)

                    return when (infractionSuspicionOrObservationType) {
                        is InfractionSuspicion ->
                            infractionSuspicionOrObservationType.copy(
                                dml = district.dml,
                                seaFront = district.facade,
                            )
                        is Observation ->
                            infractionSuspicionOrObservationType.copy(
                                dml = district.dml,
                                seaFront = district.facade,
                            )
                        else -> infractionSuspicionOrObservationType
                    }
                } catch (e: CodeNotFoundException) {
                    logger.warn("Could not add DML and sea front for vesselId: $vesselIdNotNull.", e)
                }
            }
        }

        logger.warn("No vessel id given, the infraction will be stored without DML/SeaFront.")

        return infractionSuspicionOrObservationType
    }
}
