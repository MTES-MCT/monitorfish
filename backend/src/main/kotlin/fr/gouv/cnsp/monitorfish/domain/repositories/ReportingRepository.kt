package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

interface ReportingRepository {
    fun save(
        alert: PendingAlert,
        validationDate: ZonedDateTime?,
    )

    fun save(reporting: Reporting): Reporting

    fun update(
        reportingId: Int,
        updatedInfractionSuspicion: InfractionSuspicion,
    ): Reporting

    fun update(
        reportingId: Int,
        updatedObservation: Observation,
    ): Reporting

    fun findAll(filter: ReportingFilter? = null): List<Reporting>

    fun findById(reportingId: Int): Reporting

    fun findCurrentAndArchivedByVesselIdentifierEquals(
        vesselIdentifier: VesselIdentifier,
        value: String,
        fromDate: ZonedDateTime,
    ): List<Reporting>

    fun findCurrentAndArchivedByVesselIdEquals(
        vesselId: Int,
        fromDate: ZonedDateTime,
    ): List<Reporting>

    fun findCurrentAndArchivedWithoutVesselIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        fromDate: ZonedDateTime,
    ): List<Reporting>

    fun archive(id: Int)

    fun delete(id: Int)
}
