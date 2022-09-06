package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlEntity
import org.springframework.data.repository.CrudRepository
import java.time.Instant

interface DBControlRepository : CrudRepository<ControlEntity, Long> {
    fun findAllByVesselIdEqualsAndControlDatetimeUtcAfter(vesselId: Int, afterDateTime: Instant): List<ControlEntity>
}
