package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import fr.gouv.cnsp.monitorfish.infrastructure.database.filters.ReportingFilter
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllCurrentReportings(
    private val reportingRepository: ReportingRepository,
    private val lastPositionRepository: LastPositionRepository,
    private val getAllControlUnits: GetAllControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllCurrentReportings::class.java)

    fun execute(): List<Pair<Reporting, ControlUnit?>> {
        val filter =
            ReportingFilter(
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION),
            )

        val currents = reportingRepository.findAll(filter)
        val controlUnits = getAllControlUnits.execute()

        currents.forEach {
            it.underCharter =
                try {
                    when (it.vesselIdentifier) {
                        VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                            require(it.internalReferenceNumber != null) {
                                "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                            }
                            lastPositionRepository.findUnderCharterForVessel(
                                it.vesselIdentifier,
                                it.internalReferenceNumber,
                            )
                        }
                        VesselIdentifier.IRCS -> {
                            require(it.ircs != null) {
                                "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                            }
                            lastPositionRepository.findUnderCharterForVessel(it.vesselIdentifier, it.ircs)
                        }
                        VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                            require(it.externalReferenceNumber != null) {
                                "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                            }
                            lastPositionRepository.findUnderCharterForVessel(
                                it.vesselIdentifier,
                                it.externalReferenceNumber,
                            )
                        }
                        else -> null
                    }
                } catch (e: Throwable) {
                    logger.error(
                        "Last position not found for vessel \"${it.internalReferenceNumber}/${it.ircs}/${it.externalReferenceNumber}\" " +
                            "and vessel identifier \"${it.vesselIdentifier}\": ${e.message}",
                    )

                    null
                }
        }

        return currents.map { reporting ->
            if (reporting.type == ReportingType.ALERT) {
                return@map Pair(reporting, null)
            }

            val controlUnitId = (reporting.value as InfractionSuspicionOrObservationType).controlUnitId
            return@map Pair(reporting, controlUnits.find { it.id == controlUnitId })
        }
    }
}
