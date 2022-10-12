package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.ControlAndInfractionIds
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlRepository
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaControlRepository(
    private val dbControlRepository: DBControlRepository,
    private val mapper: ObjectMapper
) : ControlRepository {

    override fun findVesselControlsAfterDateTime(vesselId: Int, afterDateTime: ZonedDateTime): List<ControlAndInfractionIds> {
        return dbControlRepository.findAllByVesselIdEqualsAndControlDatetimeUtcAfter(
            vesselId,
            afterDateTime.toInstant()
        )
            .map { control ->
                ControlAndInfractionIds(control.toControl(mapper), control.infractionIds ?: listOf())
            }
    }
}
