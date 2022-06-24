package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.BeaconMalfunctionNotificationType
import fr.gouv.cnsp.monitorfish.domain.use_cases.beacon_malfunction.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.SaveBeaconMalfunctionCommentDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateBeaconMalfunctionDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BeaconMalfunctionDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.BeaconMalfunctionResumeAndDetailsDataOutput
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import javax.websocket.server.PathParam

@RestController
@RequestMapping("/bff/v1/beacon_malfunctions")
@Api(description = "APIs for beacon malfunctions")
class BeaconMalfunctionController(
        private val getAllBeaconMalfunctions: GetAllBeaconMalfunctions,
        private val updateBeaconMalfunction: UpdateBeaconMalfunction,
        private val getBeaconMalfunction: GetBeaconMalfunction,
        private val saveBeaconMalfunctionComment: SaveBeaconMalfunctionComment,
        private val requestNotification: RequestNotification) {

    @GetMapping(value = [""])
    @ApiOperation("Get all beacon malfunctions")
    fun getAllBeaconMalfunctions(): List<BeaconMalfunctionDataOutput> {
        return getAllBeaconMalfunctions.execute().map {
            BeaconMalfunctionDataOutput.fromBeaconMalfunction(it)
        }
    }

    @PutMapping(value = ["/{beaconMalfunctionId}"], consumes = ["application/json"])
    @ApiOperation("Update a beacon malfunction")
    fun updateBeaconMalfunction(@PathParam("Beacon malfunction id")
                                @PathVariable(name = "beaconMalfunctionId")
                                beaconMalfunctionId: Int,
                                @RequestBody
                                updateBeaconMalfunctionData: UpdateBeaconMalfunctionDataInput): BeaconMalfunctionResumeAndDetailsDataOutput {
        return updateBeaconMalfunction.execute(
                id = beaconMalfunctionId,
                vesselStatus = updateBeaconMalfunctionData.vesselStatus,
                stage = updateBeaconMalfunctionData.stage,
                endOfBeaconMalfunctionReason = updateBeaconMalfunctionData.endOfBeaconMalfunctionReason,
        ).let {
            BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(it)
        }
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = ["/{beaconMalfunctionId}/comments"], consumes = ["application/json"])
    @ApiOperation("Save a beacon malfunction comment and return the updated beacon malfunction")
    fun saveBeaconMalfunctionComment(@PathParam("Beacon malfunction id")
                                     @PathVariable(name = "beaconMalfunctionId")
                                     beaconMalfunctionId: Int,
                                     @RequestBody
                                     saveBeaconMalfunctionCommentDataInput: SaveBeaconMalfunctionCommentDataInput): BeaconMalfunctionResumeAndDetailsDataOutput {
        return saveBeaconMalfunctionComment.execute(
                beaconMalfunctionId = beaconMalfunctionId,
                comment = saveBeaconMalfunctionCommentDataInput.comment,
                userType = saveBeaconMalfunctionCommentDataInput.userType).let {
            BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(it)
        }
    }

    @GetMapping(value = ["/{beaconMalfunctionId}"])
    @ApiOperation("Get a beacon malfunction with the comments and history")
    fun getBeaconMalfunction(@PathParam("Beacon malfunction id")
                             @PathVariable(name = "beaconMalfunctionId")
                             beaconMalfunctionId: Int): BeaconMalfunctionResumeAndDetailsDataOutput {
        return BeaconMalfunctionResumeAndDetailsDataOutput.fromBeaconMalfunctionResumeAndDetails(getBeaconMalfunction.execute(beaconMalfunctionId))
    }

    @PutMapping(value = ["/{beaconMalfunctionId}/{notificationRequested}"])
    @ApiOperation("Request a notification")
    fun requestNotification(@PathParam("Beacon malfunction id")
                            @PathVariable(name = "beaconMalfunctionId")
                            beaconMalfunctionId: Int,
                            @PathParam("Notification type requested")
                            @PathVariable(name = "notificationRequested")
                            notificationRequested: BeaconMalfunctionNotificationType) {
        return requestNotification.execute(
                id = beaconMalfunctionId,
                notificationRequested = notificationRequested)
    }
}
