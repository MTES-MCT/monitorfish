package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import kotlin.time.measureTimedValue

@UseCase
class GetVesselReportings(
    private val reportingRepository: ReportingRepository,
    private val infractionRepository: InfractionRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger = LoggerFactory.getLogger(GetVesselReportings::class.java)

    fun execute(
        vesselId: Int?,
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        vesselIdentifier: VesselIdentifier?,
        fromDate: ZonedDateTime,
    ): VesselReportings {
        val (controlUnits, controlUnitsTimeTaken) = measureTimedValue { getAllLegacyControlUnits.execute() }
        logger.info("TIME_RECORD - 'getAllControlUnits' took $controlUnitsTimeTaken")

        val (reportings, reportingsTimeTaken) =
            measureTimedValue {
                if (vesselId != null) {
                    return@measureTimedValue findReportingsByVesselId(vesselId, fromDate)
                }

                findReportingsByVesselIdentity(
                    vesselIdentifier,
                    internalReferenceNumber,
                    fromDate,
                    ircs,
                    externalReferenceNumber,
                )
            }
        logger.info("TIME_RECORD - 'findReportings' took $reportingsTimeTaken")

        val (current, currentTimeTaken) =
            measureTimedValue {
                getReportingsAndOccurrences(reportings.filter { !it.isArchived })
                    .sortedWith(compareByDescending { it.reporting.validationDate ?: it.reporting.creationDate })
                    .map { reportingAndOccurrences ->
                        enrichWithInfractionAndControlUnit(reportingAndOccurrences, controlUnits)
                    }
            }
        logger.info("TIME_RECORD - 'current' took $currentTimeTaken")

        val yearsRange = fromDate.year..ZonedDateTime.now().year
        val (archivedYearsToReportings, archivedYearsToReportingsTimeTaken) =
            measureTimedValue {
                yearsRange.associateWith { year ->
                    val reportingsOfYear =
                        reportings
                            .filter { it.isArchived }
                            .filter { filterByYear(it, year) }

                    return@associateWith getReportingsAndOccurrences(reportingsOfYear)
                        .sortedWith(compareByDescending { it.reporting.validationDate ?: it.reporting.creationDate })
                        .map { reportingAndOccurrences ->
                            enrichWithInfractionAndControlUnit(reportingAndOccurrences, controlUnits)
                        }
                }
            }
        logger.info("TIME_RECORD - 'archivedYearsToReportings' took $archivedYearsToReportingsTimeTaken")

        val (infractionSuspicionsSummary, infractionSuspicionsSummaryTimeTaken) =
            measureTimedValue {
                getInfractionSuspicionsSummary(reportings.filter { it.isArchived })
            }
        logger.info("TIME_RECORD - 'infractionSuspicionsSummary' took $infractionSuspicionsSummaryTimeTaken")
        val numberOfInfractionSuspicions = infractionSuspicionsSummary.sumOf { it.numberOfOccurrences }
        val numberOfObservation =
            reportings
                .filter { it.isArchived && it.type == ReportingType.OBSERVATION }
                .size

        val reportingSummary =
            ReportingSummary(
                infractionSuspicionsSummary = infractionSuspicionsSummary,
                numberOfInfractionSuspicions = numberOfInfractionSuspicions,
                numberOfObservations = numberOfObservation,
            )

        return VesselReportings(
            current = current,
            archived = archivedYearsToReportings,
            summary = reportingSummary,
        )
    }

    private fun getInfractionSuspicionsSummary(
        reportings: List<Reporting>,
    ): List<ReportingTitleAndNumberOfOccurrences> {
        val alertsSummary =
            reportings
                .filter { it.type == ReportingType.ALERT }
                .groupBy { (it.value as AlertType).type }
                .map { (type, reportings) ->
                    ReportingTitleAndNumberOfOccurrences(
                        title = "${type.alertName} (NATINF ${reportings[0].value.natinfCode})",
                        numberOfOccurrences = reportings.size,
                    )
                }

        val infractionSuspicionsSummary =
            reportings
                .filter { it.type == ReportingType.INFRACTION_SUSPICION }
                .groupBy { (it.value as InfractionSuspicion).natinfCode }
                .map { (natinfCode, reportings) ->
                    val infraction =
                        try {
                            infractionRepository.findInfractionByNatinfCode(natinfCode)
                        } catch (e: NatinfCodeNotFoundException) {
                            logger.warn(e.message)

                            null
                        }

                    return@map ReportingTitleAndNumberOfOccurrences(
                        title = infraction?.infraction?.let { "$it (NATINF $natinfCode)" } ?: "NATINF $natinfCode",
                        numberOfOccurrences = reportings.size,
                    )
                }

        return (alertsSummary + infractionSuspicionsSummary).sortedByDescending { it.numberOfOccurrences }
    }

    private fun filterByYear(
        reporting: Reporting,
        year: Int,
    ): Boolean {
        if (reporting.validationDate != null) {
            return reporting.validationDate.year == year
        }

        return reporting.creationDate.year == year
    }

    private fun enrichWithInfractionAndControlUnit(
        reportingAndOccurrences: ReportingAndOccurrences,
        controlUnits: List<LegacyControlUnit>,
    ): ReportingAndOccurrences {
        val updatedInfraction =
            reportingAndOccurrences.reporting.value.natinfCode?.let { natinfCode ->
                try {
                    infractionRepository.findInfractionByNatinfCode(natinfCode)
                } catch (e: NatinfCodeNotFoundException) {
                    logger.warn(e.message)
                    null
                }
            }

        val updatedReporting =
            reportingAndOccurrences.reporting.copy(
                infraction = updatedInfraction ?: reportingAndOccurrences.reporting.infraction,
            )
        val updatedReportingAndOccurrences =
            reportingAndOccurrences.copy(
                reporting = updatedReporting,
            )

        if (updatedReporting.type == ReportingType.ALERT) {
            return updatedReportingAndOccurrences
        }

        val controlUnitId = (updatedReporting.value as? InfractionSuspicionOrObservationType)?.controlUnitId
        val foundControlUnit = controlUnits.find { it.id == controlUnitId }

        return updatedReportingAndOccurrences.copy(controlUnit = foundControlUnit)
    }

    private fun getReportingsAndOccurrences(reportings: List<Reporting>): List<ReportingAndOccurrences> {
        val reportingsWithoutAlerts: List<ReportingAndOccurrences> =
            reportings
                .filter { it.type != ReportingType.ALERT }
                .map { reporting ->
                    ReportingAndOccurrences(
                        otherOccurrencesOfSameAlert = emptyList(),
                        reporting = reporting,
                        controlUnit = null,
                    )
                }

        val alertTypeToAlertsOccurrences: Map<AlertTypeMapping, List<Reporting>> =
            reportings
                .filter { it.type == ReportingType.ALERT }
                .groupBy { (it.value as AlertType).type }
                .withDefault { emptyList() }

        val alertTypeToLastAlertAndOccurrences: List<ReportingAndOccurrences> =
            alertTypeToAlertsOccurrences
                .flatMap { (_, alerts) ->
                    if (alerts.isEmpty()) {
                        return@flatMap listOf()
                    }

                    val lastAlert =
                        alerts.maxByOrNull {
                            checkNotNull(it.validationDate) {
                                "An alert must have a validation date: alert ${it.id} has no validation date ($it)."
                            }

                            it.validationDate
                        }
                    checkNotNull(lastAlert) { "Last alert cannot be null" }
                    val otherOccurrencesOfSameAlert =
                        alerts
                            .filter { it.id != lastAlert.id }
                            .sortedWith(compareByDescending { it.validationDate ?: it.creationDate })

                    return@flatMap listOf(
                        ReportingAndOccurrences(
                            otherOccurrencesOfSameAlert = otherOccurrencesOfSameAlert,
                            reporting = lastAlert,
                            controlUnit = null,
                        ),
                    )
                }

        return (reportingsWithoutAlerts + alertTypeToLastAlertAndOccurrences)
    }

    private fun findReportingsByVesselId(
        vesselId: Int,
        fromDate: ZonedDateTime,
    ): List<Reporting> = reportingRepository.findCurrentAndArchivedByVesselIdEquals(vesselId, fromDate)

    private fun findReportingsByVesselIdentity(
        vesselIdentifier: VesselIdentifier?,
        internalReferenceNumber: String,
        fromDate: ZonedDateTime,
        ircs: String,
        externalReferenceNumber: String,
    ): List<Reporting> =
        when (vesselIdentifier) {
            VesselIdentifier.INTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                    vesselIdentifier,
                    internalReferenceNumber,
                    fromDate,
                )

            VesselIdentifier.IRCS ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(vesselIdentifier, ircs, fromDate)

            VesselIdentifier.EXTERNAL_REFERENCE_NUMBER ->
                reportingRepository.findCurrentAndArchivedByVesselIdentifierEquals(
                    vesselIdentifier,
                    externalReferenceNumber,
                    fromDate,
                )

            else ->
                reportingRepository.findCurrentAndArchivedWithoutVesselIdentifier(
                    internalReferenceNumber,
                    externalReferenceNumber,
                    ircs,
                    fromDate,
                )
        }
}
