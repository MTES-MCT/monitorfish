package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.DistrictRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class AddReporting(
    private val reportingRepository: ReportingRepository,
    private val vesselRepository: VesselRepository,
    private val districtRepository: DistrictRepository
) {
    private val logger: Logger = LoggerFactory.getLogger(AddReporting::class.java)

    fun execute(newReporting: Reporting): Reporting {
        logger.info(
            "Adding reporting for vessel ${newReporting.internalReferenceNumber}/${newReporting.externalReferenceNumber}/${newReporting.ircs}"
        )

        require(newReporting.type != ReportingType.ALERT) {
            "The reporting type must be OBSERVATION or INFRACTION_SUSPICION"
        }

        newReporting.value as InfractionSuspicionOrObservationType
        newReporting.value.checkReportingActorAndFieldsRequirements()

        val nextReporting = getReportingWithDMLAndSeaFront(newReporting)

        return reportingRepository.save(nextReporting)
    }

    private fun getReportingWithDMLAndSeaFront(newReporting: Reporting): Reporting {
        if (newReporting.type == ReportingType.INFRACTION_SUSPICION) {
            newReporting.value as InfractionSuspicion

            newReporting.vesselId?.let { vesselId ->
                val districtCode = try {
                    vesselRepository.findVessel(vesselId).districtCode
                } catch (e: NoSuchElementException) {
                    logger.warn("Vessel id $vesselId of reporting not found.", e)

                    null
                }

                districtCode?.let {
                    try {
                        val district = districtRepository.find(it)

                        return newReporting.copy(
                            value = newReporting.value.copy(dml = district.dml, seaFront = district.facade)
                        )
                    } catch (e: CodeNotFoundException) {
                        logger.warn("Could not add DML and sea front.", e)
                    }
                }
            }
        }

        return newReporting
    }
}
