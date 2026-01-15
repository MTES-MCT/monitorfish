package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
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

    fun execute(reporting: Reporting): Reporting {
        val vesselId = reporting.vesselId
        vesselId?.let { vesselIdNotNull ->
            val districtCode = vesselRepository.findVesselById(vesselIdNotNull)?.districtCode

            districtCode?.let {
                try {
                    val district = districtRepository.find(it)

                    return when (reporting) {
                        is Reporting.InfractionSuspicion ->
                            reporting.copy(
                                dml = district.dml,
                                seaFront = district.facade,
                            )
                        is Reporting.Observation ->
                            reporting.copy(
                                dml = district.dml,
                                seaFront = district.facade,
                            )
                        is Reporting.Alert -> reporting
                    }
                } catch (e: CodeNotFoundException) {
                    logger.warn("Could not add DML and sea front for vesselId: $vesselIdNotNull.", e)
                }
            }
        }

        logger.warn("No vessel id given, the reporting will be stored without DML/SeaFront.")

        return reporting
    }
}
