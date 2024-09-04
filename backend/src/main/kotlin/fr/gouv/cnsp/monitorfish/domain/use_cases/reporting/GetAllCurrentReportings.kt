package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllCurrentReportings(
    private val reportingRepository: ReportingRepository,
    private val vesselRepository: VesselRepository,
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

        val currentReportings = reportingRepository.findAll(filter)
        val controlUnits = getAllControlUnits.execute()

        val currentReportingsWithCharterInfo =
            currentReportings.map { reporting ->
                val underCharter =
                    try {
                        when (reporting.vesselIdentifier) {
                            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                                requireNotNull(reporting.internalReferenceNumber) {
                                    "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                                }
                                vesselRepository.findUnderCharterForVessel(
                                    reporting.vesselIdentifier,
                                    reporting.internalReferenceNumber,
                                )
                            }

                            VesselIdentifier.IRCS -> {
                                requireNotNull(reporting.ircs) {
                                    "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                                }
                                vesselRepository.findUnderCharterForVessel(reporting.vesselIdentifier, reporting.ircs)
                            }

                            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                                requireNotNull(reporting.externalReferenceNumber) {
                                    "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                                }
                                vesselRepository.findUnderCharterForVessel(
                                    reporting.vesselIdentifier,
                                    reporting.externalReferenceNumber,
                                )
                            }

                            else -> null
                        }
                    } catch (e: Throwable) {
                        logger.debug(
                            "Last position not found for vessel \"${reporting.internalReferenceNumber}/${reporting.ircs}/${reporting.externalReferenceNumber}\" " +
                                "and vessel identifier \"${reporting.vesselIdentifier}\": ${e.message}",
                        )
                        null
                    }

                reporting.copy(underCharter = underCharter)
            }

        return currentReportingsWithCharterInfo.map { reporting ->
            if (reporting.type == ReportingType.ALERT) {
                return@map Pair(reporting, null)
            }

            val controlUnitId = (reporting.value as InfractionSuspicionOrObservationType).controlUnitId
            return@map Pair(reporting, controlUnits.find { it.id == controlUnitId })
        }
    }
}
