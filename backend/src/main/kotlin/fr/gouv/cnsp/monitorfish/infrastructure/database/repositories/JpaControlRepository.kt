package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Control
import fr.gouv.cnsp.monitorfish.domain.repositories.ControlRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ControlEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBControlRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaControlRepository(private val dbControlRepository: DBControlRepository) : ControlRepository {

    override fun findVesselControls(vesselId: Int): List<Control> {
        return dbControlRepository.findAllByVesselIdEquals(vesselId).map {
            it.toControl()
        }
    }

}
