package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
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

    override fun findAllByUser(user: String): List<VesselGroupBase> =
        dbVesselGroupRepository.findAllByUser(user).map {
            it.toVesselGroup(mapper)
        }

    override fun findById(id: Int): VesselGroupBase = dbVesselGroupRepository.findById(id).get().toVesselGroup(mapper)

    @Modifying
    override fun save(vesselGroup: DynamicVesselGroup): DynamicVesselGroup {
        val savedGroup =
            dbVesselGroupRepository.save(
                VesselGroupEntity.fromDynamicVesselGroup(mapper, vesselGroup),
            )

        return savedGroup.toVesselGroup(mapper) as DynamicVesselGroup
    }

    @Modifying
    override fun save(vesselGroup: FixedVesselGroup): FixedVesselGroup {
        val savedGroup =
            dbVesselGroupRepository.save(
                VesselGroupEntity.fromFixedVesselGroup(mapper, vesselGroup),
            )

        return savedGroup.toVesselGroup(mapper) as FixedVesselGroup
    }

    @Modifying
    override fun delete(id: Int) {
        dbVesselGroupRepository.deleteById(id)
    }
}
