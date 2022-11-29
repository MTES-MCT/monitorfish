package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateFleetSegmentException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FleetSegmentEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFleetSegmentRepository
import org.springframework.stereotype.Repository
import javax.transaction.Transactional

@Repository
class JpaFleetSegmentRepository(private val dbFleetSegmentRepository: DBFleetSegmentRepository) : FleetSegmentRepository {

    override fun findAll(): List<FleetSegment> {
        return dbFleetSegmentRepository.findAll().map {
            it.toFleetSegment()
        }
    }

    override fun findAllByYear(year: Int): List<FleetSegment> {
        return dbFleetSegmentRepository.findAllByYearEquals(year).map {
            it.toFleetSegment()
        }
    }

    @Transactional
    override fun update(segment: String, fields: CreateOrUpdateFleetSegmentFields, year: Int): FleetSegment {
        try {
            fields.segment?.let {
                dbFleetSegmentRepository.updateSegment(segment, it, year)
            }

            fields.segmentName?.let {
                dbFleetSegmentRepository.updateSegmentName(segment, it, year)
            }

            fields.gears?.let {
                dbFleetSegmentRepository.updateGears(segment, it.toArrayString(), year)
            }

            fields.faoAreas?.let {
                dbFleetSegmentRepository.updateFAOAreas(segment, it.toArrayString(), year)
            }

            fields.targetSpecies?.let {
                dbFleetSegmentRepository.updateTargetSpecies(segment, it.toArrayString(), year)
            }

            fields.bycatchSpecies?.let {
                dbFleetSegmentRepository.updateBycatchSpecies(segment, it.toArrayString(), year)
            }

            fields.impactRiskFactor?.let {
                dbFleetSegmentRepository.updateImpactRiskFactor(segment, it, year)
            }

            return fields.segment?.let {
                dbFleetSegmentRepository.findBySegmentAndYearEquals(it, year).toFleetSegment()
            } ?: run {
                dbFleetSegmentRepository.findBySegmentAndYearEquals(segment, year).toFleetSegment()
            }
        } catch (e: Throwable) {
            throw CouldNotUpdateFleetSegmentException("Could not update fleet segment: ${e.message}")
        }
    }

    @Transactional
    override fun delete(segment: String, year: Int) {
        try {
            dbFleetSegmentRepository.deleteBySegmentAndYear(segment, year)
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not delete fleet segment: ${e.message}")
        }
    }

    @Transactional
    override fun create(segment: FleetSegment) {
        dbFleetSegmentRepository.save(FleetSegmentEntity.fromFleetSegment(segment))
    }

    override fun findYearEntries(): List<Int> {
        return dbFleetSegmentRepository.findDistinctYears()
    }

    @Transactional
    override fun addYear(currentYear: Int, nextYear: Int) {
        dbFleetSegmentRepository.duplicateCurrentYearAsNextYear(currentYear, nextYear)
    }

    fun List<String>.toArrayString(): String = this.joinToString(",", "{", "}")
}
