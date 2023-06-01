package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.TestUtils.Companion.getMockApiClient
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(WebSecurityConfig::class, OIDCProperties::class, UserAuthorizationCheckFilter::class)
@WebMvcTest(
    value = [(AuthorizationController::class)],
    properties = [
        "monitorfish.oidc.enabled=true",
        "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        "monitorfish.oidc.userinfo-endpoint=/api/user",
    ],
)
class AuthorizationControllerITests {
    val VALID_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"

    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var jwtDecoder: JwtDecoder

    @TestConfiguration
    class TestApiClient {
        @Bean
        fun mockApiClient(): ApiClient {
            return getMockApiClient()
        }
    }

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @Test
    fun `Should return 200 if the user is a super user`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api.perform(
            get("/bff/v1/authorization/is_super_user")
                .header("Authorization", "Bearer $VALID_JWT"),
        )
            // Then
            .andExpect(status().isOk)
    }

    @Test
    fun `Should return 401 if the user is not a super user`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)

        // When
        api.perform(
            get("/bff/v1/authorization/is_super_user")
                .header("Authorization", "Bearer $VALID_JWT"),
        )
            // Then
            .andExpect(status().isUnauthorized)
    }
}
