package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.AddOrUpdateDynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.DeleteVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllVesselGroups
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.DynamicVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.DynamicVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FixedVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
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
    private val getAllVesselGroups: GetAllVesselGroups,
    private val deleteVesselGroup: DeleteVesselGroup,
) {
    private val logger = LoggerFactory.getLogger(VesselGroupController::class.java)

    @PostMapping("")
    @Operation(summary = "Add or update a dynamic vessel group")
    fun addOrUpdateVesselGroup(
        response: HttpServletResponse,
        @RequestBody
        vesselGroupInput: DynamicVesselGroupDataInput,
    ): DynamicVesselGroupDataOutput {
        val email: String = getEmail(response)

        return DynamicVesselGroupDataOutput.fromDynamicVesselGroup(
            addOrUpdateDynamicVesselGroup.execute(email, vesselGroupInput.toCreateOrUpdateDynamicVesselGroup()),
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
                is FixedVesselGroup -> FixedVesselGroupDataOutput.fromFixedVesselGroup(it)
            }
        }
    }

    private fun getEmail(response: HttpServletResponse) =
        (
            response.getHeader(UserAuthorizationCheckFilter.EMAIL_HEADER)
                ?: throw BackendUsageException(
                    BackendUsageErrorCode.UNAUTHORIZED,
                    message = "Email not found. Rejecting request.",
                )
        )
}
