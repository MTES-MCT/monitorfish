package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselGroupEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class JpaVesselGroupRepository(
    private val dbVesselGroupRepository: DBVesselGroupRepository,
    private val mapper: ObjectMapper,
) : VesselGroupRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselGroupRepository::class.java)

    override fun findAllByUserAndSharing(
        user: String,
        service: CnspService?,
    ): List<VesselGroupBase> =
        dbVesselGroupRepository.findAllByUserAndSharing(user = user, service = service?.value).map {
            it.toVesselGroup(mapper)
        }

    override fun findById(id: Int): VesselGroupBase = dbVesselGroupRepository.findById(id).get().toVesselGroup(mapper)

    @Transactional
    override fun upsert(vesselGroup: DynamicVesselGroup): DynamicVesselGroup {
        val savedGroupId =
            vesselGroup.id?.let { id ->
                dbVesselGroupRepository.updateVesselGroup(
                    VesselGroupEntity.fromDynamicVesselGroup(mapper, vesselGroup),
                    toSqlArrayString(vesselGroup.sharedTo?.map { it.value })
                )

                id
            } ?: dbVesselGroupRepository.saveVesselGroup(
                VesselGroupEntity.fromDynamicVesselGroup(mapper, vesselGroup),
                toSqlArrayString(vesselGroup.sharedTo?.map { it.value })
            )

        return findById(savedGroupId) as DynamicVesselGroup
    }

    @Transactional
    override fun upsert(vesselGroup: FixedVesselGroup): FixedVesselGroup {
        val savedGroupId =
            vesselGroup.id?.let { id ->
                dbVesselGroupRepository.updateVesselGroup(
                    VesselGroupEntity.fromFixedVesselGroup(mapper, vesselGroup),
                    toSqlArrayString(vesselGroup.sharedTo?.map { it.value })
                )

                id
            } ?: dbVesselGroupRepository.saveVesselGroup(
                VesselGroupEntity.fromFixedVesselGroup(mapper, vesselGroup),
                toSqlArrayString(vesselGroup.sharedTo?.map { it.value })
            )

        return findById(savedGroupId) as FixedVesselGroup
    }

    override fun delete(id: Int) {
        dbVesselGroupRepository.deleteById(id)
    }
}
