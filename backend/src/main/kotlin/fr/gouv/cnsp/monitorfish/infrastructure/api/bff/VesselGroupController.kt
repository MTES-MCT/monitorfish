package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.Utils.getEmail
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.DynamicVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.FixedVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.DynamicVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.DynamicVesselGroupWithVesselsDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FixedVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FixedVesselGroupWithVesselsDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletResponse
import jakarta.websocket.server.PathParam
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/vessel_groups")
@Tag(name = "APIs for vessel groups")
class VesselGroupController(
    private val addOrUpdateDynamicVesselGroup: AddOrUpdateDynamicVesselGroup,
    private val addOrUpdateFixedVesselGroup: AddOrUpdateFixedVesselGroup,
    private val getAllVesselGroups: GetAllVesselGroups,
    private val deleteVesselGroup: DeleteVesselGroup,
    private val deleteFixedVesselGroupVessel: DeleteFixedVesselGroupVessel,
    private val getAllVesselGroupsWithVessels: GetAllVesselGroupsWithVessels,
) {
    private val logger = LoggerFactory.getLogger(VesselGroupController::class.java)

    @PostMapping("/dynamic")
    @Operation(summary = "Add or update a dynamic vessel group")
    fun addOrUpdateDynamicVesselGroup(
        response: HttpServletResponse,
        @RequestBody
        vesselGroupInput: DynamicVesselGroupDataInput,
    ): DynamicVesselGroupDataOutput {
        val email: String = getEmail(response)

        val vesselGroup =
            addOrUpdateDynamicVesselGroup.execute(
                email,
                vesselGroupInput.toCreateOrUpdateDynamicVesselGroup(),
            )

        return DynamicVesselGroupDataOutput.fromDynamicVesselGroup(
            vesselGroup,
        )
    }

    @PostMapping("/fixed")
    @Operation(summary = "Add or update a fixed vessel group")
    fun addOrUpdateFixedVesselGroup(
        response: HttpServletResponse,
        @RequestBody
        vesselGroupInput: FixedVesselGroupDataInput,
    ): FixedVesselGroupDataOutput {
        val email: String = getEmail(response)

        val vesselGroup =
            addOrUpdateFixedVesselGroup.execute(
                email,
                vesselGroupInput.toCreateOrUpdateFixedVesselGroup(),
            )

        return FixedVesselGroupDataOutput.fromFixedVesselGroup(
            vesselGroup = vesselGroup,
        )
    }

    @DeleteMapping(value = ["/{id}"])
    @Operation(summary = "Delete a vessel group")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteVesselGroup(
        response: HttpServletResponse,
        @PathParam("Vessel group id")
        @PathVariable(name = "id")
        id: Int,
    ) {
        val email: String = getEmail(response)

        deleteVesselGroup.execute(email, id)
    }

    @GetMapping("")
    @Operation(summary = "Get all dynamic and fixed vessel groups")
    fun getVesselGroups(response: HttpServletResponse): List<Any> {
        val email: String = getEmail(response)

        return getAllVesselGroups.execute(email).map {
            when (it) {
                is DynamicVesselGroup -> DynamicVesselGroupDataOutput.fromDynamicVesselGroup(it)
                is FixedVesselGroup ->
                    FixedVesselGroupDataOutput.fromFixedVesselGroup(
                        vesselGroup = it,
                    )
            }
        }
    }

    @GetMapping(value = ["/vessels"])
    @Operation(summary = "Get all vessel groups with vessels")
    fun getVesselGroupsWithVessels(response: HttpServletResponse): List<Any> {
        val email: String = getEmail(response)
        val groupWithVessels = getAllVesselGroupsWithVessels.execute(email)

        return groupWithVessels.map { groupWithVessels ->
            when (groupWithVessels.group) {
                is DynamicVesselGroup ->
                    DynamicVesselGroupWithVesselsDataOutput.fromDynamicVesselGroup(
                        group = groupWithVessels.group,
                        vessels = groupWithVessels.vessels,
                    )
                is FixedVesselGroup ->
                    FixedVesselGroupWithVesselsDataOutput.fromFixedVesselGroup(
                        group = groupWithVessels.group,
                        vessels = groupWithVessels.vessels,
                    )
            }
        }
    }

    @DeleteMapping(value = ["/{groupId}/{vesselIndex}"])
    @Operation(summary = "Delete a vessel from a group")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteVesselFromGroup(
        response: HttpServletResponse,
        @PathParam("Vessel group id")
        @PathVariable(name = "groupId")
        groupId: Int,
        @PathParam("Vessel index")
        @PathVariable(name = "vesselIndex")
        vesselIndex: Int,
    ) {
        val email: String = getEmail(response)

        deleteFixedVesselGroupVessel.execute(userEmail = email, groupId = groupId, vesselIndex = vesselIndex)
    }
}
