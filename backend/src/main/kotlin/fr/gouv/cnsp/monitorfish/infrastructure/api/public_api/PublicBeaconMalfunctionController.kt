package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateBeaconMalfunctionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BeaconMalfunctionResumeAndDetailsDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/beacon_malfunctions")
@Tag(name = "Public APIs for beacon malfunctions")
class PublicBeaconMalfunctionController(
    private val updateBeaconMalfunction: UpdateBeaconMalfunction,
    private val requestNotification: RequestNotification,
) {

    @PutMapping(value = ["/{beaconMalfunctionId}"], consumes = ["application/json"])
    @Operation(summary = "Update a beacon malfunction")
    fun updateBeaconMalfunction(
        @PathParam("Beacon malfunction id")
        @PathVariable(name = "beaconMalfunctionId")
        beaconMalfunctionId: Int,
        @RequestBody
        updateBeaconMalfunctionData: UpdateBeaconMalfunctionDataInput,
    ): BeaconMalfunctionResumeAndDetailsDataOutput {
        return updateBeaconMalfunction.execute(
            id = beaconMalfunctionId,
            vesselStatus = updateBeaconMalfunctionData.vesselStatus,
            stage = updateBeaconMalfunctionData.stage,
            endOfBeaconMalfunctionReason = updateBeaconMalfunctionData.endOfBeaconMalfunctionReason,
        ).let {
            BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(it)
        }
    }

    @PutMapping(value = ["/{beaconMalfunctionId}/{notificationRequested}"])
    @Operation(summary = "Request a notification")
    fun requestNotification(
        @PathParam("Beacon malfunction id")
        @PathVariable(name = "beaconMalfunctionId")
        beaconMalfunctionId: Int,
        @PathParam("Notification type requested")
        @PathVariable(name = "notificationRequested")
        notificationRequested: BeaconMalfunctionNotificationType,
        @Parameter(name = "ISO3 country code of the FMC to notify")
        @RequestParam(name = "requestedNotificationForeignFmcCode")
        requestedNotificationForeignFmcCode: String? = null,
    ) {
        return requestNotification.execute(
            id = beaconMalfunctionId,
            notificationRequested = notificationRequested,
            requestedNotificationForeignFmcCode = requestedNotificationForeignFmcCode,
        )
    }
}
