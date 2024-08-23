package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllControlUnits
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetVesselReportings(
    private val reportingRepository: ReportingRepository,
    private val infractionRepository: InfractionRepository,
    private val getAllControlUnits: GetAllControlUnits,
) {
    private val logger = LoggerFactory.getLogger(GetVesselReportings::class.java)

    fun execute(
        vesselId: Int?,
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        vesselIdentifier: VesselIdentifier?,
        fromDate: ZonedDateTime,
    ): CurrentAndArchivedReportings {
        val controlUnits = getAllControlUnits.execute()

        val reportings = findReportings(
            vesselId,
            vesselIdentifier,
            internalReferenceNumber,
            fromDate,
            ircs,
            externalReferenceNumber,
        )

        val current = getReportingsAndOccurrences(reportings.filter { !it.isArchived })
            .sortedWith(compareByDescending { it.reporting.validationDate ?: it.reporting.creationDate })
            .map { reportingAndOccurrences ->
                enrichWithInfractionAndControlUnit(reportingAndOccurrences, controlUnits)
            }

        val yearsRange = fromDate.year..ZonedDateTime.now().year
        val archivedYearsToReportings = yearsRange.associateWith { year ->
            val reportingsOfYear = reportings
                .filter { it.isArchived }
                .filter { filterByYear(it, year) }

            getReportingsAndOccurrences(reportingsOfYear)
                .sortedWith(compareByDescending { it.reporting.validationDate ?: it.reporting.creationDate })
                .map { reportingAndOccurrences ->
                    enrichWithInfractionAndControlUnit(reportingAndOccurrences, controlUnits)
                }
        }

        return CurrentAndArchivedReportings(current, archivedYearsToReportings)
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
        controlUnits: List<ControlUnit>,
    ): ReportingAndOccurrences {
        val updatedInfraction = reportingAndOccurrences.reporting.value.natinfCode?.let { natinfCode ->
            try {
                infractionRepository.findInfractionByNatinfCode(natinfCode)
            } catch (e: NatinfCodeNotFoundException) {
                logger.warn(e.message)
                null
            }
        }

        val updatedReporting = reportingAndOccurrences.reporting.copy(
            infraction = updatedInfraction ?: reportingAndOccurrences.reporting.infraction,
        )
        val updatedReportingAndOccurrences = reportingAndOccurrences.copy(
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
        val reportingsWithoutAlerts: List<ReportingAndOccurrences> = reportings
            .filter { it.type != ReportingType.ALERT }
            .map { reporting ->
                ReportingAndOccurrences(
                    otherOccurrences = emptyList(),
                    reporting = reporting,
                    controlUnit = null,
                )
            }

        val alertTypeToAlertsOccurrences: Map<AlertTypeMapping, List<Reporting>> = reportings
            .filter { it.type == ReportingType.ALERT }
            .groupBy { (it.value as AlertType).type }
            .withDefault { emptyList() }

        val alertTypeToLastAlertAndOccurrences: List<ReportingAndOccurrences> = alertTypeToAlertsOccurrences
            .flatMap { (_, alerts) ->
                if (alerts.isEmpty()) {
                    return@flatMap listOf()
                }

                val lastAlert = alerts.maxByOrNull {
                    checkNotNull(it.validationDate) {
                        "An alert must have a validation date: alert ${it.id} has no validation date ($it)."
                    }

                    it.validationDate
                }
                checkNotNull(lastAlert) { "Last alert cannot be null" }
                val otherOccurrences = alerts.filter { it.id != lastAlert.id }

                return@flatMap listOf(
                    ReportingAndOccurrences(
                        otherOccurrences = otherOccurrences,
                        reporting = lastAlert,
                        controlUnit = null,
                    ),
                )
            }

        return (reportingsWithoutAlerts + alertTypeToLastAlertAndOccurrences)
    }

    private fun findReportings(
        vesselId: Int?,
        vesselIdentifier: VesselIdentifier?,
        internalReferenceNumber: String,
        fromDate: ZonedDateTime,
        ircs: String,
        externalReferenceNumber: String,
    ): List<Reporting> {
        if (vesselId != null) {
            return reportingRepository.findCurrentAndArchivedByVesselIdEquals(vesselId, fromDate)
        }

        return when (vesselIdentifier) {
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

            else -> reportingRepository.findCurrentAndArchivedWithoutVesselIdentifier(
                internalReferenceNumber,
                externalReferenceNumber,
                ircs,
                fromDate,
            )
        }
    }
}
