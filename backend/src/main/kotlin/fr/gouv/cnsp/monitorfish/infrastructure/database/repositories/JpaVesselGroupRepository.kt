package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroup
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselGroupEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselGroupRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository

@Repository
class JpaVesselGroupRepository(
    private val dbVesselGroupRepository: DBVesselGroupRepository,
    private val mapper: ObjectMapper,
) : VesselGroupRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselGroupRepository::class.java)

    override fun findAllByUser(user: String): List<VesselGroup> =
        dbVesselGroupRepository.findAllByUser(user).map {
            it.toVesselGroup(mapper)
        }

    @Modifying
    override fun save(vesselGroup: VesselGroup): VesselGroup {
        val savedGroup =
            dbVesselGroupRepository.save(
                VesselGroupEntity.fromVesselGroup(mapper, vesselGroup),
            )

        return savedGroup.toVesselGroup(mapper)
    }

    @Modifying
    override fun delete(id: Int) {
        dbVesselGroupRepository.deleteById(id)
    }
}
