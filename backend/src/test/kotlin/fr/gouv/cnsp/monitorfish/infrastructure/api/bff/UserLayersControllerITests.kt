package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.given
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.GetUserLayers
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.InitUserLayers
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers.SaveUserLayers
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UserLayersDataInput
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
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
@WebMvcTest(value = [UserLayersController::class])
class UserLayersControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockitoBean
    private lateinit var getUserLayers: GetUserLayers

    @MockitoBean
    private lateinit var initUserLayers: InitUserLayers

    @MockitoBean
    private lateinit var saveUserLayers: SaveUserLayers

    private val eezLayer = AdministrativeLayer(type = "eez_areas", zone = null)

    private val userLayers =
        UserLayers(
            hashedEmail = "hashed",
            administrativeLayers = listOf(eezLayer),
            showedRegulatoryZoneIds = listOf("7"),
            selectedRegulatoryZoneIds = listOf("8"),
            baseLayer = "SATELLITE",
        )

    private val input =
        UserLayersDataInput(
            administrativeLayers = listOf(eezLayer),
            showedRegulatoryZoneIds = listOf("7"),
            selectedRegulatoryZoneIds = listOf("8"),
            baseLayer = "SATELLITE",
        )

    private fun authenticatedRequest() = oidcLogin().idToken { token -> token.claim("email", "email@domain-name.com") }

    @Test
    fun `Should get the user layers`() {
        given(getUserLayers.execute(any())).willReturn(userLayers)

        api
            .perform(get("/bff/v1/user_layers").with(authenticatedRequest()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.administrativeLayers.length()", equalTo(1)))
            .andExpect(jsonPath("$.administrativeLayers[0].type", equalTo("eez_areas")))
            .andExpect(jsonPath("$.showedRegulatoryZoneIds[0]", equalTo("7")))
            .andExpect(jsonPath("$.selectedRegulatoryZoneIds[0]", equalTo("8")))
            .andExpect(jsonPath("$.baseLayer", equalTo("SATELLITE")))
            .andExpect(jsonPath("$.hashedEmail").doesNotExist())

        verify(getUserLayers).execute("email@domain-name.com")
    }

    @Test
    fun `Should return empty user layers When the user has no layers record`() {
        given(getUserLayers.execute(any())).willReturn(null)

        api
            .perform(get("/bff/v1/user_layers").with(authenticatedRequest()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.administrativeLayers.length()", equalTo(0)))
            .andExpect(jsonPath("$.showedRegulatoryZoneIds.length()", equalTo(0)))
            .andExpect(jsonPath("$.selectedRegulatoryZoneIds.length()", equalTo(0)))
            .andExpect(jsonPath("$.baseLayer", nullValue()))
    }

    @Test
    fun `Should seed the user layers from the local storage settings`() {
        given(initUserLayers.execute(any(), any(), any(), any(), anyOrNull())).willReturn(userLayers)

        api
            .perform(
                post("/bff/v1/user_layers/init")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(input)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.baseLayer", equalTo("SATELLITE")))

        verify(initUserLayers).execute(
            eq("email@domain-name.com"),
            eq(listOf(eezLayer)),
            eq(listOf("7")),
            eq(listOf("8")),
            eq("SATELLITE"),
        )
    }

    @Test
    fun `Should save the user layers`() {
        given(saveUserLayers.execute(any(), any(), any(), any(), anyOrNull())).willReturn(userLayers)

        api
            .perform(
                put("/bff/v1/user_layers")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(input)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.administrativeLayers[0].type", equalTo("eez_areas")))

        verify(saveUserLayers).execute(
            eq("email@domain-name.com"),
            eq(listOf(eezLayer)),
            eq(listOf("7")),
            eq(listOf("8")),
            eq("SATELLITE"),
        )
    }
}
