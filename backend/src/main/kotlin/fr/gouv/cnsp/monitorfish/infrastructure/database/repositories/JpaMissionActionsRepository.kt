package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaMissionActionsRepository(
    private val dbControlRepository: DBControlRepository,
    private val mapper: ObjectMapper
) : MissionActionsRepository {

    override fun findVesselMissionActionsAfterDateTime(vesselId: Int, afterDateTime: ZonedDateTime): List<MissionAction> {
        return dbControlRepository.findAllByVesselIdEqualsAndActionDatetimeUtcAfter(
            vesselId,
            afterDateTime.toInstant()
        ).map { control -> control.toMissionAction(mapper) }
    }
}
