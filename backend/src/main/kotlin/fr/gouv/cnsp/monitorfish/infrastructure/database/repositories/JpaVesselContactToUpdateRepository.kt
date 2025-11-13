package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselContactToUpdateRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselContactToUpdateEntity.Companion.fromVesselContactToUpdate
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBVesselContactToUpdateRepository
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class JpaVesselContactToUpdateRepository(
    private val dbVesselContactToUpdateRepository: DBVesselContactToUpdateRepository,
) : VesselContactToUpdateRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaVesselContactToUpdateRepository::class.java)

    override fun findByVesselId(vesselId: Int): VesselContactToUpdate? =
        dbVesselContactToUpdateRepository.findByVesselId(vesselId)?.toVesselContactToUpdate()

    @Transactional
    override fun save(vesselContactToUpdate: VesselContactToUpdate): VesselContactToUpdate =
        dbVesselContactToUpdateRepository
            .save(fromVesselContactToUpdate(vesselContactToUpdate))
            .toVesselContactToUpdate()
}
