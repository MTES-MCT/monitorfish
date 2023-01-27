package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBReportingRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime
import jakarta.transaction.Transactional

@Repository
class JpaReportingRepository(
    private val dbReportingRepository: DBReportingRepository,
    private val mapper: ObjectMapper
) : ReportingRepository {

    override fun save(alert: PendingAlert, validationDate: ZonedDateTime?) {
        dbReportingRepository.save(ReportingEntity.fromPendingAlert(alert, validationDate, mapper))
    }

    override fun save(reporting: Reporting): Reporting {
        return dbReportingRepository.save(ReportingEntity.fromReporting(reporting, mapper)).toReporting(mapper)
    }

    @Transactional
    override fun update(reportingId: Int, updatedInfractionSuspicion: InfractionSuspicion): Reporting {
        dbReportingRepository.update(
            reportingId,
            mapper.writeValueAsString(updatedInfractionSuspicion),
            ReportingType.INFRACTION_SUSPICION.toString()
        )

        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    @Transactional
    override fun update(reportingId: Int, updatedObservation: Observation): Reporting {
        dbReportingRepository.update(
            reportingId,
            mapper.writeValueAsString(updatedObservation),
            ReportingType.OBSERVATION.toString()
        )

        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    override fun findAll(): List<Reporting> {
        return dbReportingRepository.findAll().map { it.toReporting(mapper) }
    }

    override fun findById(reportingId: Int): Reporting {
        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    override fun findAllCurrent(): List<Reporting> {
        return dbReportingRepository.findAllCurrentReportings().map { it.toReporting(mapper) }
    }

    override fun findCurrentAndArchivedByVesselIdentifierEquals(
        vesselIdentifier: VesselIdentifier,
        value: String,
        fromDate: ZonedDateTime
    ): List<Reporting> {
        return dbReportingRepository
            .findCurrentAndArchivedByVesselIdentifier(vesselIdentifier.toString(), value, fromDate.toInstant()).map {
                it.toReporting(mapper)
            }
    }

    override fun findCurrentAndArchivedWithoutVesselIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        fromDate: ZonedDateTime
    ): List<Reporting> {
        if (internalReferenceNumber.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER.toString(),
                    internalReferenceNumber,
                    fromDate.toInstant()
                ).map {
                    it.toReporting(mapper)
                }
        }

        if (ircs.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(VesselIdentifier.IRCS.toString(), ircs, fromDate.toInstant()).map {
                    it.toReporting(mapper)
                }
        }

        if (externalReferenceNumber.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER.toString(),
                    externalReferenceNumber,
                    fromDate.toInstant()
                ).map {
                    it.toReporting(mapper)
                }
        }

        return listOf()
    }

    @Transactional
    override fun archive(id: Int) {
        dbReportingRepository.archiveReporting(id)
    }

    @Transactional
    override fun delete(id: Int) {
        dbReportingRepository.deleteReporting(id)
    }
}
