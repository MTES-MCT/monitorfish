package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.AddFavoriteVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.DeleteFavoriteVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.GetFavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.InitFavoriteVessels
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.VesselIdentityDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.FavoriteVesselsVesselIdentityDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/favorite_vessels")
@Tag(name = "APIs for Favorite vessels")
class FavoriteVesselsController(
    private val getFavoriteVessels: GetFavoriteVessels,
    private val initFavoriteVessels: InitFavoriteVessels,
    private val addFavoriteVessel: AddFavoriteVessel,
    private val deleteFavoriteVessel: DeleteFavoriteVessel,
) {
    @GetMapping("")
    @Operation(summary = "Get user favorite vessels")
    fun getUserFavoriteVessels(
        @AuthenticationPrincipal principal: OidcUser?,
    ): List<FavoriteVesselsVesselIdentityDataOutput> {
        val email: String = principal?.email ?: ""

        return getFavoriteVessels.execute(email).map {
            FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(it)
        }
    }

    @PostMapping("/init")
    @Operation(summary = "Seed the user favorite vessels from the browser local storage list")
    fun initUserFavoriteVessels(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody vesselIdentities: List<VesselIdentityDataInput>,
    ): List<FavoriteVesselsVesselIdentityDataOutput> {
        val email: String = principal?.email ?: ""

        return initFavoriteVessels.execute(email, vesselIdentities.map { it.toVesselIdentity() }).map {
            FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(it)
        }
    }

    @PutMapping("")
    @Operation(summary = "Add a vessel to the user favorite vessels")
    fun addUserFavoriteVessel(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody vesselIdentity: VesselIdentityDataInput,
    ): List<FavoriteVesselsVesselIdentityDataOutput> {
        val email: String = principal?.email ?: ""

        return addFavoriteVessel.execute(email, vesselIdentity.toVesselIdentity()).map {
            FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(it)
        }
    }

    @DeleteMapping("")
    @Operation(summary = "Remove a vessel from the user favorite vessels")
    fun deleteUserFavoriteVessel(
        @AuthenticationPrincipal principal: OidcUser?,
        @RequestBody vesselIdentity: VesselIdentityDataInput,
    ): List<FavoriteVesselsVesselIdentityDataOutput> {
        val email: String = principal?.email ?: ""

        return deleteFavoriteVessel.execute(email, vesselIdentity.toVesselIdentity()).map {
            FavoriteVesselsVesselIdentityDataOutput.fromVesselIdentity(it)
        }
    }
}
