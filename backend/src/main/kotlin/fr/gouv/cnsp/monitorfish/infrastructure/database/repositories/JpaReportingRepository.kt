package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PendingAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.Alert
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.CurrentReporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ReportingEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.mappers.ReportingMapper
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBReportingRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.serialization.AlertValueDto
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import jakarta.transaction.Transactional
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaReportingRepository(
    private val dbReportingRepository: DBReportingRepository,
    private val entityManager: EntityManager,
    private val mapper: ObjectMapper,
) : ReportingRepository {
    override fun findAllCurrent(): List<CurrentReporting> =
        dbReportingRepository.findAllCurrent().map { row ->
            CurrentReporting(
                id = row[0] as Int,
                type = ReportingType.valueOf(row[1] as String),
                vesselId = row[2] as Int?,
                internalReferenceNumber = row[3] as String?,
            )
        }

    override fun save(
        alert: PendingAlert,
        validationDate: ZonedDateTime?,
    ) {
        dbReportingRepository.save(ReportingEntity.fromPendingAlert(alert, validationDate, mapper))
    }

    override fun save(reporting: Reporting): Reporting =
        dbReportingRepository.save(ReportingEntity.fromReporting(reporting, mapper)).toReporting(mapper)

    @Transactional
    override fun update(
        reportingId: Int,
        updatedReporting: Reporting,
    ): Reporting {
        val valueJson = mapper.writeValueAsString(ReportingMapper.getValueFromReporting(updatedReporting))
        dbReportingRepository.update(
            id = reportingId,
            value = valueJson,
            type = updatedReporting.type.toString(),
            expirationDate = updatedReporting.expirationDate?.toInstant(),
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
                predicates.add(
                    getIsArchivedPredicate(
                        isArchived = isArchived,
                        reportingEntity = reportingEntity,
                        criteriaBuilder = criteriaBuilder,
                    ),
                )
            }
            it.isDeleted?.let { isDeleted ->
                predicates.add(
                    getIsDeletedPredicate(
                        isDeleted = isDeleted,
                        reportingEntity = reportingEntity,
                        criteriaBuilder = criteriaBuilder,
                    ),
                )
            }
            it.types?.let { types ->
                predicates.add(getTypesPredicate(types = types, reportingEntity = reportingEntity))
            }
            it.vesselInternalReferenceNumbers?.let { vesselInternalReferenceNumbers ->
                predicates.add(
                    getVesselInternalReferenceNumbersPredicate(
                        vesselInternalReferenceNumbers = vesselInternalReferenceNumbers,
                        reportingEntity = reportingEntity,
                    ),
                )
            }
            it.vesselIds?.let { vesselIds ->
                predicates.add(
                    getVesselIdsPredicate(vesselIds = vesselIds, reportingEntity = reportingEntity),
                )
            }
        }

        criteriaQuery.select(reportingEntity).where(*predicates.toTypedArray())

        return entityManager.createQuery(criteriaQuery).resultList.map { it.toReporting(mapper) }
    }

    override fun findById(reportingId: Int): Reporting =
        dbReportingRepository.findById(reportingId).get().toReporting(mapper)

    override fun findCurrentAndArchivedByVesselIdentifierEquals(
        vesselIdentifier: VesselIdentifier,
        value: String,
        fromDate: ZonedDateTime,
    ): List<Reporting> =
        dbReportingRepository
            .findCurrentAndArchivedByVesselIdentifier(vesselIdentifier.toString(), value, fromDate.toInstant())
            .map {
                it.toReporting(mapper)
            }

    override fun findCurrentInfractionSuspicionsByVesselId(vesselId: Int): List<Reporting> =
        dbReportingRepository
            .findCurrentInfractionSuspicionsByVesselId(vesselId)
            .map {
                it.toReporting(mapper)
            }

    override fun findCurrentAndArchivedByVesselIdEquals(
        vesselId: Int,
        fromDate: ZonedDateTime,
    ): List<Reporting> =
        dbReportingRepository
            .findCurrentAndArchivedByVesselId(vesselId, fromDate.toInstant())
            .map {
                it.toReporting(mapper)
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

    override fun findUnarchivedReportingsAfterNewVoyage(): List<Pair<Int, Alert>> =
        dbReportingRepository.findAllUnarchivedAfterDEPLogbookMessage().map { result ->
            Pair(
                result[0] as Int,
                mapper.readValue(result[1] as String?, AlertValueDto::class.java).toAlert(),
            )
        }

    override fun findExpiredReportings(): List<Int> = dbReportingRepository.findExpiredReportings()

    override fun archiveReportings(ids: List<Int>): Int = dbReportingRepository.archiveReportings(ids)

    @Transactional
    override fun delete(id: Int) {
        dbReportingRepository.deleteReporting(id)
    }

    private fun getIsArchivedPredicate(
        isArchived: Boolean,
        reportingEntity: Root<ReportingEntity>,
        criteriaBuilder: CriteriaBuilder,
    ): Predicate = criteriaBuilder.equal(reportingEntity.get<Boolean>("isArchived"), isArchived)

    private fun getIsDeletedPredicate(
        isDeleted: Boolean,
        reportingEntity: Root<ReportingEntity>,
        criteriaBuilder: CriteriaBuilder,
    ): Predicate = criteriaBuilder.equal(reportingEntity.get<Boolean>("isDeleted"), isDeleted)

    private fun getTypesPredicate(
        types: List<ReportingType>,
        reportingEntity: Root<ReportingEntity>,
    ): Predicate = reportingEntity.get<ReportingType>("type").`in`(*types.toTypedArray())

    private fun getVesselInternalReferenceNumbersPredicate(
        vesselInternalReferenceNumbers: List<String>,
        reportingEntity: Root<ReportingEntity>,
    ): Predicate =
        reportingEntity.get<String>("internalReferenceNumber").`in`(
            *vesselInternalReferenceNumbers.toTypedArray(),
        )

    private fun getVesselIdsPredicate(
        vesselIds: List<Int>,
        reportingEntity: Root<ReportingEntity>,
    ): Predicate =
        reportingEntity.get<String>("vesselId").`in`(
            *vesselIds.toTypedArray(),
        )
}
