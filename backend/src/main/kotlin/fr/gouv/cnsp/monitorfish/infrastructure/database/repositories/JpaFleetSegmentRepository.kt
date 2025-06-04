package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFleetSegmentRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFleetSegmentRepository(
    private val dbFleetSegmentRepository: DBFleetSegmentRepository,
) : FleetSegmentRepository {
    override fun findAll(): List<FleetSegment> =
        dbFleetSegmentRepository.findAll().map {
            it.toFleetSegment()
        }

    @Cacheable(value = ["segments_by_year"])
    override fun findAllByYear(year: Int): List<FleetSegment> =
        dbFleetSegmentRepository.findAllByYearEquals(year).map {
            it.toFleetSegment()
        }

    @Cacheable(value = ["segments_with_gears_mesh_condition"])
    override fun findAllSegmentsGearsWithRequiredMesh(year: Int): List<String> =
        dbFleetSegmentRepository.findAllSegmentsGearsHavingMinOrMaxMesh(year)

    @Transactional
    override fun update(
        segment: String,
        updatedSegment: FleetSegment,
    ): FleetSegment {
        val fleetSegmentEntity = FleetSegmentEntity.fromFleetSegment(updatedSegment)

        // The list properties needs to be formatted
        val escapedFleetSegmentEntity =
            fleetSegmentEntity.copy(
                vesselTypes = toSqlArrayString(fleetSegmentEntity.vesselTypes)?.let { listOf(it) },
                gears = toSqlArrayString(fleetSegmentEntity.gears)?.let { listOf(it) },
                faoAreas = toSqlArrayString(fleetSegmentEntity.faoAreas)?.let { listOf(it) },
                targetSpecies = toSqlArrayString(fleetSegmentEntity.targetSpecies)?.let { listOf(it) },
            )

        try {
            dbFleetSegmentRepository.updateFleetSegment(segment, escapedFleetSegmentEntity)
        } catch (e: Throwable) {
            throw BackendUsageException(
                code = BackendUsageErrorCode.COULD_NOT_UPDATE,
                message = "Could not update fleet segment",
                cause = e,
            )
        }

        return try {
            dbFleetSegmentRepository
                .findBySegmentAndYearEquals(
                    updatedSegment.segment,
                    updatedSegment.year,
                ).toFleetSegment()
        } catch (e: Throwable) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }
    }

    @Transactional
    override fun delete(
        segment: String,
        year: Int,
    ): List<FleetSegment> {
        try {
            dbFleetSegmentRepository.deleteBySegmentAndYearEquals(segment, year)

            return dbFleetSegmentRepository
                .findAllByYearEquals(year)
                .map { it.toFleetSegment() }
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not delete fleet segment: ${e.message}")
        }
    }

    @Transactional
    override fun save(segment: FleetSegment): FleetSegment {
        val fleetSegmentEntity = FleetSegmentEntity.fromFleetSegment(segment)

        // The list properties needs to be formatted
        val escapedFleetSegmentEntity =
            fleetSegmentEntity.copy(
                vesselTypes = toSqlArrayString(fleetSegmentEntity.vesselTypes)?.let { listOf(it) },
                gears = toSqlArrayString(fleetSegmentEntity.gears)?.let { listOf(it) },
                faoAreas = toSqlArrayString(fleetSegmentEntity.faoAreas)?.let { listOf(it) },
                targetSpecies = toSqlArrayString(fleetSegmentEntity.targetSpecies)?.let { listOf(it) },
            )

        dbFleetSegmentRepository.saveFleetSegment(escapedFleetSegmentEntity)

        return dbFleetSegmentRepository.findBySegmentAndYearEquals(segment.segment, segment.year).toFleetSegment()
    }

    override fun findYearEntries(): List<Int> = dbFleetSegmentRepository.findDistinctYears()

    @Transactional
    override fun addYear(
        currentYear: Int,
        nextYear: Int,
    ) {
        dbFleetSegmentRepository.duplicateCurrentYearAsNextYear(currentYear, nextYear)
    }
}
