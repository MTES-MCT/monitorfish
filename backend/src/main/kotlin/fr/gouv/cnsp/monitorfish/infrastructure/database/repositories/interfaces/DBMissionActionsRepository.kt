package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.MissionActionEntity
import org.springframework.data.repository.CrudRepository
import java.time.Instant

interface DBMissionActionsRepository : CrudRepository<MissionActionEntity, Long> {
    fun findAllByVesselIdEqualsAndActionDatetimeUtcAfter(vesselId: Int, afterDateTime: Instant): List<MissionActionEntity>
}
