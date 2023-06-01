package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
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

    override fun findAllExceptArchived(): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository.findAllExceptArchived().map { it.toBeaconMalfunction() }
    }

    override fun findLastSixtyArchived(): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository.findLastSixtyArchived().map { it.toBeaconMalfunction() }
    }

    override fun find(beaconMalfunctionId: Int): BeaconMalfunction {
        return dbBeaconMalfunctionsRepository.findById(beaconMalfunctionId).get().toBeaconMalfunction()
    }

    @Transactional
    override fun update(
        id: Int,
        vesselStatus: VesselStatus?,
        stage: Stage?,
        endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason?,
        updateDateTime: ZonedDateTime,
    ) {
        try {
            vesselStatus?.let {
                dbBeaconMalfunctionsRepository.updateVesselStatus(id, it.toString(), updateDateTime)
            }

            stage?.let {
                dbBeaconMalfunctionsRepository.updateStage(id, it.toString(), updateDateTime)
            }

            endOfBeaconMalfunctionReason?.let {
                dbBeaconMalfunctionsRepository.updateEndOfMalfunctionReason(id, it.toString(), updateDateTime)
            }
        } catch (e: Throwable) {
            throw CouldNotUpdateBeaconMalfunctionException("Could not update beacon malfunction: ${e.message}")
        }
    }

    override fun findAllByVesselId(
        vesselId: Int,
        afterDateTime: ZonedDateTime,
    ): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository
            .findAllByVesselIdEqualsAfterDateTime(vesselId, afterDateTime.toInstant()).map {
                it.toBeaconMalfunction()
            }
    }

    @Transactional
    override fun requestNotification(
        id: Int,
        notificationType: BeaconMalfunctionNotificationType,
        requestedNotificationForeignFmcCode: String?,
    ) {
        dbBeaconMalfunctionsRepository.updateRequestNotification(
            id,
            notificationType.toString(),
            requestedNotificationForeignFmcCode,
        )
    }
}
