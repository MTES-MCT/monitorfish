package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_statuses.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconStatusException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconStatusesRepository
import java.time.ZonedDateTime

@UseCase
class UpdateBeaconStatus(private val beaconStatusesRepository: BeaconStatusesRepository,
                         private val beaconStatusActionsRepository: BeaconStatusActionsRepository,
                         private val getBeaconStatus: GetBeaconStatus) {
    @Throws(CouldNotUpdateBeaconStatusException::class, IllegalArgumentException::class)
    fun execute(id: Int, vesselStatus: VesselStatus?, stage: Stage?): BeaconStatusResumeAndDetails {
        require(vesselStatus != null || stage != null) {
            "No value to update"
        }
        val previousBeaconStatus = beaconStatusesRepository.find(id)
        val updateDateTime = ZonedDateTime.now()

        beaconStatusesRepository.update(id, vesselStatus, stage, updateDateTime)

        var propertyName: BeaconStatusActionPropertyName? = vesselStatus?.let { BeaconStatusActionPropertyName.VESSEL_STATUS }
        propertyName = stage?.let { BeaconStatusActionPropertyName.STAGE } ?: propertyName

        require(propertyName != null) {
            "The property to update could not be identified"
        }

        val previousValue = when (propertyName) {
            BeaconStatusActionPropertyName.STAGE -> previousBeaconStatus.stage.name
            BeaconStatusActionPropertyName.VESSEL_STATUS -> previousBeaconStatus.vesselStatus.name
        }

        val nextValue = when (propertyName) {
            BeaconStatusActionPropertyName.STAGE -> stage!!.name
            BeaconStatusActionPropertyName.VESSEL_STATUS -> vesselStatus!!.name
        }

        val beaconStatusAction = BeaconStatusAction(
                beaconStatusId = id,
                propertyName = propertyName,
                previousValue = previousValue,
                nextValue = nextValue,
                dateTime = updateDateTime)

        beaconStatusActionsRepository.save(beaconStatusAction)

        return getBeaconStatus.execute(id)
    }
}
