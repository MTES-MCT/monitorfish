package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunction
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.VesselStatus
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconMalfunctionException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconMalfunctionsRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaBeaconMalfunctionsRepository(private val dbBeaconMalfunctionsRepository: DBBeaconMalfunctionsRepository) : BeaconMalfunctionsRepository {

    override fun findAll(): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository.findAll().map { it.toBeaconMalfunction() }
    }

    override fun findAllExceptEndOfFollowUp(): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository.findAllExceptArchived().map { it.toBeaconMalfunction() }
    }

    override fun findLastThirtyEndOfFollowUp(): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository.findLastThirtyArchived().map { it.toBeaconMalfunction() }
    }

    override fun find(beaconMalfunctionId: Int): BeaconMalfunction {
        return dbBeaconMalfunctionsRepository.findById(beaconMalfunctionId).get().toBeaconMalfunction()
    }

    @Transactional
    override fun update(id: Int, vesselStatus: VesselStatus?, stage: Stage?, updateDateTime: ZonedDateTime) {
        try {
            vesselStatus?.let {
                dbBeaconMalfunctionsRepository.updateVesselStatus(id, it.toString(), updateDateTime)
            }

            stage?.let {
                dbBeaconMalfunctionsRepository.updateStage(id, it.toString(), updateDateTime)
            }
        } catch (e: Throwable) {
            throw CouldNotUpdateBeaconMalfunctionException("Could not update beacon status: ${e.message}")
        }
    }
}
