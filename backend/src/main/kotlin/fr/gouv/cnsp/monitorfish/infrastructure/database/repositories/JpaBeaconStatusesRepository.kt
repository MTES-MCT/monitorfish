package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconStatusesRepository
import org.springframework.stereotype.Repository

@Repository
class JpaBeaconStatusesRepository(private val dbBeaconStatusesRepository: DBBeaconStatusesRepository) : BeaconStatusesRepository {

    override fun findAll(): List<BeaconStatus> {
        return dbBeaconStatusesRepository.findAll().map { it.toBeaconStatus() }
    }
}
