package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.GetUserLayers
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.InitUserLayers
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.SaveUserLayers
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UserLayersDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.UserLayersDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/user_layers")
@Tag(name = "APIs for user layers")
class UserLayersController(
    private val getUserLayers: GetUserLayers,
    private val initUserLayers: InitUserLayers,
    private val saveUserLayers: SaveUserLayers,
) {
    @GetMapping("")
    @Operation(summary = "Get user layers (administrative layers, showed and selected regulatory zones, base layer)")
    fun getUserLayers(
        @AuthenticationPrincipal principal: OidcUser?,
    ): UserLayersDataOutput {
        val email: String = principal?.email ?: ""

        return getUserLayers.execute(email)?.let { UserLayersDataOutput.fromUserLayers(it) }
            ?: UserLayersDataOutput.EMPTY
    }

    @PostMapping("/init")
    @Operation(summary = "Seed the user layers from the browser local storage settings")
    fun initUserLayers(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody userLayers: UserLayersDataInput,
    ): UserLayersDataOutput {
        val email: String = principal?.email ?: ""

        return UserLayersDataOutput.fromUserLayers(
            initUserLayers.execute(
                email,
                userLayers.administrativeLayers,
                userLayers.showedRegulatoryZoneIds,
                userLayers.selectedRegulatoryZoneIds,
                userLayers.baseLayer,
            ),
        )
    }

    @PutMapping("")
    @Operation(summary = "Save the user layers")
    fun saveUserLayers(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody userLayers: UserLayersDataInput,
    ): UserLayersDataOutput {
        val email: String = principal?.email ?: ""

        return UserLayersDataOutput.fromUserLayers(
            saveUserLayers.execute(
                email,
                userLayers.administrativeLayers,
                userLayers.showedRegulatoryZoneIds,
                userLayers.selectedRegulatoryZoneIds,
                userLayers.baseLayer,
            ),
        )
    }
}
