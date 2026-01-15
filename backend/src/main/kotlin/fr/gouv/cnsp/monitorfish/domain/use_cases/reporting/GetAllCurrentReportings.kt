package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllCurrentReportings(
    private val reportingRepository: ReportingRepository,
    private val vesselRepository: VesselRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllCurrentReportings::class.java)

    fun execute(): List<Pair<Reporting, LegacyControlUnit?>> {
        val filter =
            ReportingFilter(
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION, ReportingType.OBSERVATION),
            )

        val currentReportings = reportingRepository.findAll(filter)
        val controlUnits = getAllLegacyControlUnits.execute()

        val currentReportingsWithCharterInfo =
            currentReportings.map { reporting ->
                val vesselIdentifier = reporting.vesselIdentifier
                val internalReferenceNumber = reporting.internalReferenceNumber
                val ircs = reporting.ircs
                val externalReferenceNumber = reporting.externalReferenceNumber

                val underCharter =
                    try {
                        when (vesselIdentifier) {
                            VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                                requireNotNull(internalReferenceNumber) {
                                    "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                                }
                                vesselRepository.findUnderCharterForVessel(
                                    vesselIdentifier,
                                    internalReferenceNumber,
                                )
                            }

                            VesselIdentifier.IRCS -> {
                                requireNotNull(ircs) {
                                    "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                                }
                                vesselRepository.findUnderCharterForVessel(vesselIdentifier, ircs)
                            }

                            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                                requireNotNull(externalReferenceNumber) {
                                    "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                                }
                                vesselRepository.findUnderCharterForVessel(
                                    vesselIdentifier,
                                    externalReferenceNumber,
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

                when (reporting) {
                    is Reporting.Alert -> reporting.copy(underCharter = underCharter)
                    is Reporting.InfractionSuspicion -> reporting.copy(underCharter = underCharter)
                    is Reporting.Observation -> reporting.copy(underCharter = underCharter)
                }
            }

        return currentReportingsWithCharterInfo.map { reporting ->
            if (reporting.type == ReportingType.ALERT) {
                return@map Pair(reporting, null)
            }

            val controlUnitId =
                when (reporting) {
                    is Reporting.InfractionSuspicion -> reporting.controlUnitId
                    is Reporting.Observation -> reporting.controlUnitId
                    is Reporting.Alert -> null
                }
            return@map Pair(reporting, controlUnits.find { it.id == controlUnitId })
        }
    }
}
