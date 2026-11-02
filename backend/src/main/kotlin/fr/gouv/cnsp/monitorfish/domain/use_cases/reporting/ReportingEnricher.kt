package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingAndOccurrences
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

/**
 * Date at which a reporting occurred: alerts and infraction suspicions are dated by their validation,
 * and reportings still awaiting validation fall back to their creation.
 */
val Reporting.occurrenceDate: ZonedDateTime
    get() = validationDate ?: creationDate

class ReportingEnricher(
    private val infractionRepository: InfractionRepository,
) {
    private val logger = LoggerFactory.getLogger(ReportingEnricher::class.java)

    fun enrichWithInfractionAndControlUnit(
        reportingAndOccurrences: ReportingAndOccurrences,
        controlUnits: List<LegacyControlUnit>,
    ): ReportingAndOccurrences {
        val reporting = reportingAndOccurrences.reporting

        val updatedReporting =
            when (reporting) {
                is Reporting.Alert ->
                    reporting.copy(
                        infraction = getInfraction(reporting),
                    )
                is Reporting.InfractionSuspicion ->
                    enrichInfractions(reporting)
                is Reporting.Observation ->
                    reporting
            }

        val updatedReportingAndOccurrences =
            reportingAndOccurrences.copy(
                reporting = updatedReporting,
            )

        if (updatedReporting.type == ReportingType.ALERT) {
            return updatedReportingAndOccurrences
        }

        val controlUnitId =
            when (updatedReporting) {
                is Reporting.InfractionSuspicion -> updatedReporting.controlUnitId
                is Reporting.Observation -> updatedReporting.controlUnitId
                is Reporting.Alert -> null
            }
        val foundControlUnit = controlUnits.find { it.id == controlUnitId }

        return updatedReportingAndOccurrences.copy(controlUnit = foundControlUnit)
    }

    private fun enrichInfractions(reporting: Reporting.InfractionSuspicion): Reporting.InfractionSuspicion {
        val enriched =
            reporting.infractions.map { item ->
                val detail =
                    try {
                        infractionRepository.findInfractionByNatinfCode(item.natinfCode)
                    } catch (e: NatinfCodeNotFoundException) {
                        logger.warn(e.message)
                        null
                    }
                item.copy(infraction = detail)
            }
        return reporting.copy(infractions = enriched)
    }

    private fun getInfraction(reporting: Reporting.Alert): Infraction? =
        reporting.natinfCode.let { natinfCode ->
            try {
                infractionRepository.findInfractionByNatinfCode(natinfCode)
            } catch (e: NatinfCodeNotFoundException) {
                logger.warn(e.message)

                null
            }
        }
}
