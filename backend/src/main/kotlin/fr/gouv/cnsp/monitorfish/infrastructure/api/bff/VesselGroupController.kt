package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.AddOrUpdateDynamicVesselGroup
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.DynamicVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.DynamicVesselGroupDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/vessel_groups")
@Tag(name = "APIs for vessel groups")
class VesselGroupController(
    private val addOrUpdateDynamicVesselGroup: AddOrUpdateDynamicVesselGroup,
) {
    private val logger = LoggerFactory.getLogger(VesselGroupController::class.java)

    @PostMapping("")
    @Operation(summary = "Add or update a dynamic vessel group")
    fun addOrUpdateVesselGroup(
        response: HttpServletResponse,
        @RequestBody
        vesselGroupInput: DynamicVesselGroupDataInput,
    ): DynamicVesselGroupDataOutput {
        val email: String =
            response.getHeader(UserAuthorizationCheckFilter.EMAIL_HEADER)
                ?: throw BackendUsageException(
                    BackendUsageErrorCode.COULD_NOT_UPDATE,
                    message = "Email not found. Rejecting request.",
                )

        return DynamicVesselGroupDataOutput.fromDynamicVesselGroup(
            addOrUpdateDynamicVesselGroup.execute(email, vesselGroupInput.toDynamicVesselGroup()),
        )
    }
}
