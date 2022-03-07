package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.BeaconStatus
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.VesselStatus
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconStatusException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBBeaconStatusesRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaBeaconStatusesRepository(private val dbBeaconStatusesRepository: DBBeaconStatusesRepository) : BeaconStatusesRepository {

    override fun findAll(): List<BeaconStatus> {
        return dbBeaconStatusesRepository.findAll().map { it.toBeaconStatus() }
    }

    override fun findAllExceptResumedTransmission(): List<BeaconStatus> {
        return dbBeaconStatusesRepository.findAllExceptResumedTransmission().map { it.toBeaconStatus() }
    }

    override fun findLastThirtyResumedTransmissions(): List<BeaconStatus> {
        return dbBeaconStatusesRepository.findLastThirtyResumedTransmissions().map { it.toBeaconStatus() }
    }

    override fun find(beaconStatusId: Int): BeaconStatus {
        return dbBeaconStatusesRepository.findById(beaconStatusId).get().toBeaconStatus()
    }

    @Transactional
    override fun update(id: Int, vesselStatus: VesselStatus?, stage: Stage?, updateDateTime: ZonedDateTime) {
        try {
            vesselStatus?.let {
                dbBeaconStatusesRepository.updateVesselStatus(id, it.toString(), updateDateTime)
            }

            stage?.let {
                dbBeaconStatusesRepository.updateStage(id, it.toString(), updateDateTime)
            }
        } catch (e: Throwable) {
            throw CouldNotUpdateBeaconStatusException("Could not update beacon status: ${e.message}")
        }
    }

    override fun findAllByVesselIdentifierEquals(vesselIdentifier: VesselIdentifier, value: String, afterDateTime: ZonedDateTime): List<BeaconStatus> {
        return dbBeaconStatusesRepository
                .findAllByVesselIdentifierEqualsAfterDateTime(vesselIdentifier.toString(), value, afterDateTime.toInstant()).map {
            it.toBeaconStatus()
        }
    }
}
