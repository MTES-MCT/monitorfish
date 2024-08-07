package fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotUpdateBeaconMalfunctionException
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.BeaconMalfunctionsRepository
import java.time.ZonedDateTime

@UseCase
class UpdateBeaconMalfunction(
    private val beaconMalfunctionsRepository: BeaconMalfunctionsRepository,
    private val beaconMalfunctionActionsRepository: BeaconMalfunctionActionsRepository,
    private val getBeaconMalfunction: GetBeaconMalfunction,
) {
    @Throws(CouldNotUpdateBeaconMalfunctionException::class, IllegalArgumentException::class)
    fun execute(
        id: Int,
        vesselStatus: VesselStatus?,
        stage: Stage?,
        endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason?,
    ): BeaconMalfunctionResumeAndDetails {
        require(vesselStatus != null || stage != null) {
            "No value to update"
        }
        if (stage == Stage.ARCHIVED) {
            require(endOfBeaconMalfunctionReason != null) {
                "Cannot archive malfunction without giving an endOfBeaconMalfunctionReason"
            }
        }

        val previousBeaconMalfunction = beaconMalfunctionsRepository.find(id)
        val updateDateTime = ZonedDateTime.now()

        beaconMalfunctionsRepository.update(id, vesselStatus, stage, endOfBeaconMalfunctionReason, updateDateTime)

        var propertyName: BeaconMalfunctionActionPropertyName? = vesselStatus?.let {
            BeaconMalfunctionActionPropertyName.VESSEL_STATUS
        }
        propertyName = stage?.let { BeaconMalfunctionActionPropertyName.STAGE } ?: propertyName

        require(propertyName != null) {
            "The property to update could not be identified"
        }

        val previousValue = when (propertyName) {
            BeaconMalfunctionActionPropertyName.STAGE -> previousBeaconMalfunction.stage.name
            BeaconMalfunctionActionPropertyName.VESSEL_STATUS -> previousBeaconMalfunction.vesselStatus.name
        }

        val nextValue = when (propertyName) {
            BeaconMalfunctionActionPropertyName.STAGE -> stage!!.name
            BeaconMalfunctionActionPropertyName.VESSEL_STATUS -> vesselStatus!!.name
        }

        val beaconMalfunctionAction = BeaconMalfunctionAction(
            beaconMalfunctionId = id,
            propertyName = propertyName,
            previousValue = previousValue,
            nextValue = nextValue,
            dateTime = updateDateTime,
        )

        beaconMalfunctionActionsRepository.save(beaconMalfunctionAction)

        return getBeaconMalfunction.execute(id)
    }
}
