package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotDeleteException
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields
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

    @Transactional
    override fun update(segment: String, fields: UpdateFleetSegmentFields): FleetSegment {
        fields.segment?.let {
            dbFleetSegmentRepository.updateSegment(segment, it)
        }

        fields.segmentName?.let {
            dbFleetSegmentRepository.updateSegmentName(segment, it)
        }

        fields.gears?.let {
            dbFleetSegmentRepository.updateGears(segment, it.toArrayString())
        }

        fields.faoAreas?.let {
            dbFleetSegmentRepository.updateFAOAreas(segment, it.toArrayString())
        }

        fields.targetSpecies?.let {
            dbFleetSegmentRepository.updateTargetSpecies(segment, it.toArrayString())
        }

        fields.bycatchSpecies?.let {
            dbFleetSegmentRepository.updateBycatchSpecies(segment, it.toArrayString())
        }

        fields.impactRiskFactor?.let {
            dbFleetSegmentRepository.updateImpactRiskFactor(segment, it)
        }

        return fields.segment?.let {
            dbFleetSegmentRepository.findBySegmentEquals(it).toFleetSegment()
        } ?: run {
            dbFleetSegmentRepository.findBySegmentEquals(segment).toFleetSegment()
        }
    }

    @Transactional
    override fun delete(segment: String) {
        try {
            dbFleetSegmentRepository.deleteBySegment(segment)
        } catch (e: Throwable) {
            throw CouldNotDeleteException("Could not delete fleet segment: ${e.message}")
        }
    }

    fun List<String>.toArrayString(): String = this.joinToString(",", "{", "}")

}
