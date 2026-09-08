package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.AddFavoriteVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.DeleteFavoriteVessel
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.GetFavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.use_cases.favorite_vessels.InitFavoriteVessels
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    MapperConfiguration::class,
)
@WebMvcTest(value = [FavoriteVesselsController::class])
class FavoriteVesselsControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockitoBean
    private lateinit var getFavoriteVessels: GetFavoriteVessels

    @MockitoBean
    private lateinit var initFavoriteVessels: InitFavoriteVessels

    @MockitoBean
    private lateinit var addFavoriteVessel: AddFavoriteVessel

    @MockitoBean
    private lateinit var deleteFavoriteVessel: DeleteFavoriteVessel

    private val phenomene =
        VesselIdentity(
            vesselId = 1,
            cfr = "FAK000999999",
            ircs = "CALLME",
            externalIdentification = "DONTSINK",
            name = "PHENOMENE",
            flagState = CountryCode.FR,
            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
        )

    private fun authenticatedRequest() = oidcLogin().idToken { token -> token.claim("email", "email@domain-name.com") }

    @Test
    fun `Should get the user favorite vessels`() {
        given(getFavoriteVessels.execute(any())).willReturn(listOf(phenomene))

        api
            .perform(get("/bff/v1/favorite_vessels").with(authenticatedRequest()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].vesselId", equalTo(1)))
            .andExpect(jsonPath("$[0].name", equalTo("PHENOMENE")))
            .andExpect(jsonPath("$[0].flagState", equalTo("FR")))

        verify(getFavoriteVessels).execute("email@domain-name.com")
    }

    @Test
    fun `Should return an empty list When the user has no favorite vessels`() {
        given(getFavoriteVessels.execute(any())).willReturn(listOf())

        api
            .perform(get("/bff/v1/favorite_vessels").with(authenticatedRequest()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(0)))
    }

    @Test
    fun `Should seed the user favorite vessels from the local storage list`() {
        given(initFavoriteVessels.execute(any(), any())).willReturn(listOf(phenomene))

        api
            .perform(
                post("/bff/v1/favorite_vessels/init")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(listOf(phenomene))),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].name", equalTo("PHENOMENE")))

        verify(initFavoriteVessels).execute(eq("email@domain-name.com"), eq(listOf(phenomene)))
    }

    @Test
    fun `Should add a vessel to the user favorite vessels`() {
        given(addFavoriteVessel.execute(any(), any())).willReturn(listOf(phenomene))

        api
            .perform(
                put("/bff/v1/favorite_vessels")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(phenomene)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].name", equalTo("PHENOMENE")))

        verify(addFavoriteVessel).execute(eq("email@domain-name.com"), eq(phenomene))
    }

    @Test
    fun `Should remove a vessel from the user favorite vessels`() {
        given(deleteFavoriteVessel.execute(any(), any())).willReturn(listOf())

        api
            .perform(
                delete("/bff/v1/favorite_vessels")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(phenomene)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(0)))

        verify(deleteFavoriteVessel).execute(eq("email@domain-name.com"), eq(phenomene))
    }
}
