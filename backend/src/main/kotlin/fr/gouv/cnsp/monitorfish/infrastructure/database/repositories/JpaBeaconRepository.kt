package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository

@Repository
class JpaBeaconRepository(private val dbBeaconRepository: DBBeaconRepository) : BeaconRepository {

    @Cacheable(value = ["search_beacons"])
    override fun search(searched: String): List<Beacon> {
        if (searched.isEmpty()) {
            return listOf()
        }

        return dbBeaconRepository.searchBy(searched).map { it.toBeacon() }
    }

    @Cacheable(value = ["find_beacon"])
    override fun findBeaconNumberByVesselId(vesselId: Int): String {
        return dbBeaconRepository.findByVesselId(vesselId).beaconNumber
    }
}
