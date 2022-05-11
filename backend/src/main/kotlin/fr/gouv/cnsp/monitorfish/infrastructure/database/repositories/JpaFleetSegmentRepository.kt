package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.repositories.FleetSegmentRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBFleetSegmentRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaFleetSegmentRepository(private val dbFleetSegmentRepository: DBFleetSegmentRepository) : FleetSegmentRepository {

    @Cacheable(value = ["fleet_segments"])
    override fun findAll(): List<FleetSegment> {
        return dbFleetSegmentRepository.findAll().map {
            it.toFleetSegment()
        }
    }

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

    fun List<String>.toArrayString(): String = this.joinToString(",", "{", "}")

}
