package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBReportingRepository
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaReportingRepository(
    private val dbReportingRepository: DBReportingRepository,
    @Autowired private val entityManager: EntityManager,
    private val mapper: ObjectMapper,
) : ReportingRepository {
    override fun save(
        alert: PendingAlert,
        validationDate: ZonedDateTime?,
    ) {
        dbReportingRepository.save(ReportingEntity.fromPendingAlert(alert, validationDate, mapper))
    }

    override fun save(reporting: Reporting): Reporting {
        return dbReportingRepository.save(ReportingEntity.fromReporting(reporting, mapper)).toReporting(mapper)
    }

    @Transactional
    override fun update(
        reportingId: Int,
        updatedInfractionSuspicion: InfractionSuspicion,
    ): Reporting {
        dbReportingRepository.update(
            reportingId,
            mapper.writeValueAsString(updatedInfractionSuspicion),
            ReportingType.INFRACTION_SUSPICION.toString(),
        )

        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    @Transactional
    override fun update(
        reportingId: Int,
        updatedObservation: Observation,
    ): Reporting {
        dbReportingRepository.update(
            reportingId,
            mapper.writeValueAsString(updatedObservation),
            ReportingType.OBSERVATION.toString(),
        )

        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    override fun findAll(filter: ReportingFilter?): List<Reporting> {
        val criteriaBuilder = entityManager.criteriaBuilder
        val criteriaQuery = criteriaBuilder.createQuery(ReportingEntity::class.java)
        val reportingEntity = criteriaQuery.from(ReportingEntity::class.java)

        val predicates = mutableListOf(criteriaBuilder.isTrue(criteriaBuilder.literal(true)))

        filter?.let {
            it.isArchived?.let { isArchived ->
                predicates.add(getIsArchivedPredicate(isArchived, reportingEntity, criteriaBuilder))
            }
            it.isDeleted?.let { isDeleted ->
                predicates.add(getIsDeletedPredicate(isDeleted, reportingEntity, criteriaBuilder))
            }
            it.types?.let { types ->
                predicates.add(getTypesPredicate(types, reportingEntity))
            }
            it.vesselInternalReferenceNumbers?.let { vesselInternalReferenceNumbers ->
                predicates.add(
                    getVesselInternalReferenceNumbersPredicate(vesselInternalReferenceNumbers, reportingEntity),
                )
            }
        }

        criteriaQuery.select(reportingEntity).where(*predicates.toTypedArray())

        return entityManager.createQuery(criteriaQuery).resultList.map { it.toReporting(mapper) }
    }

    override fun findById(reportingId: Int): Reporting {
        return dbReportingRepository.findById(reportingId).get().toReporting(mapper)
    }

    override fun findCurrentAndArchivedByVesselIdentifierEquals(
        vesselIdentifier: VesselIdentifier,
        value: String,
        fromDate: ZonedDateTime,
    ): List<Reporting> {
        return dbReportingRepository
            .findCurrentAndArchivedByVesselIdentifier(vesselIdentifier.toString(), value, fromDate.toInstant()).map {
                it.toReporting(mapper)
            }
    }

    override fun findCurrentAndArchivedByVesselIdEquals(
        vesselId: Int,
        fromDate: ZonedDateTime,
    ): List<Reporting> {
        return dbReportingRepository
            .findCurrentAndArchivedByVesselId(vesselId, fromDate.toInstant()).map {
                it.toReporting(mapper)
            }
    }

    override fun findCurrentAndArchivedWithoutVesselIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        fromDate: ZonedDateTime,
    ): List<Reporting> {
        if (internalReferenceNumber.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(
                    VesselIdentifier.INTERNAL_REFERENCE_NUMBER.toString(),
                    internalReferenceNumber,
                    fromDate.toInstant(),
                ).map {
                    it.toReporting(mapper)
                }
        }

        if (ircs.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(
                    VesselIdentifier.IRCS.toString(),
                    ircs,
                    fromDate.toInstant(),
                ).map {
                    it.toReporting(mapper)
                }
        }

        if (externalReferenceNumber.isNotEmpty()) {
            return dbReportingRepository
                .findCurrentAndArchivedByVesselIdentifier(
                    VesselIdentifier.EXTERNAL_REFERENCE_NUMBER.toString(),
                    externalReferenceNumber,
                    fromDate.toInstant(),
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

    private fun getIsArchivedPredicate(
        isArchived: Boolean,
        reportingEntity: Root<ReportingEntity>,
        criteriaBuilder: CriteriaBuilder,
    ): Predicate {
        return criteriaBuilder.equal(reportingEntity.get<Boolean>("isArchived"), isArchived)
    }

    private fun getIsDeletedPredicate(
        isDeleted: Boolean,
        reportingEntity: Root<ReportingEntity>,
        criteriaBuilder: CriteriaBuilder,
    ): Predicate {
        return criteriaBuilder.equal(reportingEntity.get<Boolean>("isDeleted"), isDeleted)
    }

    private fun getTypesPredicate(
        types: List<ReportingType>,
        reportingEntity: Root<ReportingEntity>,
    ): Predicate {
        return reportingEntity.get<ReportingType>("type").`in`(*types.toTypedArray())
    }

    private fun getVesselInternalReferenceNumbersPredicate(
        vesselInternalReferenceNumbers: List<String>,
        reportingEntity: Root<ReportingEntity>,
    ): Predicate {
        return reportingEntity.get<String>("internalReferenceNumber").`in`(
            *vesselInternalReferenceNumbers.toTypedArray(),
        )
    }
}
