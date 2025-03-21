package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.AddOrUpdateDynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllVesselGroups
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.TestUtils.Companion.getMockApiClient
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.oidc.APIOIDCRepository
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    UserAuthorizationCheckFilter::class,
    SentryConfig::class,
    CustomAuthenticationEntryPoint::class,
    APIOIDCRepository::class,
)
@WebMvcTest(
    value = [(VesselGroupController::class)],
    properties = [
        "monitorfish.oidc.enabled=true",
        "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        "monitorfish.oidc.userinfo-endpoint=/api/user",
        "monitorfish.oidc.issuer-uri=http://issuer-uri.gouv.fr",
    ],
)
class VesselGroupControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var jwtDecoder: JwtDecoder

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @TestConfiguration
    class TestApiClient {
        @Bean
        fun mockApiClient(): ApiClient = getMockApiClient()
    }

    @MockBean
    private lateinit var addOrUpdateDynamicVesselGroup: AddOrUpdateDynamicVesselGroup

    @MockBean
    private lateinit var getAllVesselGroups: GetAllVesselGroups

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should save a dynamic vessel group`() {
        // Given
        val groupToSave = TestUtils.getDynamicVesselGroups().first()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(addOrUpdateDynamicVesselGroup.execute(any(), any())).willReturn(groupToSave)

        // When
        api
            .perform(
                post("/bff/v1/vessel_groups")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}")
                    .content(objectMapper.writeValueAsString(groupToSave.copy(id = null)))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name", equalTo("Mission Thémis – chaluts de fonds")))

        Mockito.verify(addOrUpdateDynamicVesselGroup).execute("email@domain-name.com", groupToSave.copy(id = null))
    }

    @Test
    fun `Should get all dynamic vessel groups`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(getAllVesselGroups.execute(any())).willReturn(TestUtils.getDynamicVesselGroups())

        // When
        api
            .perform(
                get("/bff/v1/vessel_groups")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}")
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].name", equalTo("Mission Thémis – chaluts de fonds")))
            .andExpect(jsonPath("$[0].filters.hasLogbook", equalTo(true)))

        Mockito.verify(getAllVesselGroups).execute("email@domain-name.com")
    }
}
