package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
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
    override fun update(id: Int,
                        vesselStatus: VesselStatus?,
                        stage: Stage?,
                        endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason?,
                        updateDateTime: ZonedDateTime) {
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

    override fun findAllByVesselIdentifierEquals(vesselIdentifier: VesselIdentifier, value: String, afterDateTime: ZonedDateTime): List<BeaconMalfunction> {
        return dbBeaconMalfunctionsRepository
                .findAllByVesselIdentifierEqualsAfterDateTime(vesselIdentifier.toString(), value, afterDateTime.toInstant()).map {
                    it.toBeaconMalfunction()
                }
    }

    override fun findAllByVesselWithoutVesselIdentifier(internalReferenceNumber: String,
                                                        externalReferenceNumber: String,
                                                        ircs: String,
                                                        afterDateTime: ZonedDateTime): List<BeaconMalfunction> {
        if(internalReferenceNumber.isNotEmpty()) {
            return dbBeaconMalfunctionsRepository
                .findAllByVesselIdentifierEqualsAfterDateTime(VesselIdentifier.INTERNAL_REFERENCE_NUMBER.toString(), internalReferenceNumber, afterDateTime.toInstant()).map {
                    it.toBeaconMalfunction()
                }
        }

        if(ircs.isNotEmpty()) {
            return dbBeaconMalfunctionsRepository
                .findAllByVesselIdentifierEqualsAfterDateTime(VesselIdentifier.IRCS.toString(), ircs, afterDateTime.toInstant()).map {
                    it.toBeaconMalfunction()
                }
        }

        if(externalReferenceNumber.isNotEmpty()) {
            return dbBeaconMalfunctionsRepository
                .findAllByVesselIdentifierEqualsAfterDateTime(VesselIdentifier.EXTERNAL_REFERENCE_NUMBER.toString(), externalReferenceNumber, afterDateTime.toInstant()).map {
                    it.toBeaconMalfunction()
                }
        }

        return listOf()
    }

    @Transactional
    override fun requestNotification(id: Int, notificationType: BeaconMalfunctionNotificationType) {
        dbBeaconMalfunctionsRepository.updateRequestNotification(id, notificationType.toString())
    }
}
