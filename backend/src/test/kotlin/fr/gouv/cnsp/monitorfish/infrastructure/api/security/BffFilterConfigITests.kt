package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import fr.gouv.cnsp.monitorfish.config.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    BffFilterConfig::class,
    ApiClient::class,
    SentryConfig::class,
)
@WebMvcTest(
    value = [VersionController::class],
    properties = [
        "monitorfish.oidc.enabled=true",
        "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        "monitorfish.oidc.userinfo-endpoint=/api/user",
    ],
)
class BffFilterConfigITests {
    val VALID_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var buildProperties: BuildProperties

    @Test
    fun `Should return 401 for all user authorization protected paths`() {
        // When
        /**
         * This test return a 401 http code as the issuer uri could not be fetched (404 not found because of the dummy url).
         * Hence, the bearer is valid but the request is invalid
         * When this test is failing, a 404 http code will be returned (as the controllers are not mounted in this test)
         */
        listOf(
            "/bff/v1/vessels",
            "/bff/v1/beacon_malfunctions",
            "/bff/v1/missions",
            "/bff/v1/operational_alerts",
            "/bff/v1/reportings",
            "/bff/v1/vessels/risk_factors",
        ).forEach {
            mockMvc.perform(
                get(it)
                    .header("Authorization", "Bearer $VALID_JWT"),
            )
                // Then
                .andExpect(status().isUnauthorized)
        }
    }

    @Test
    fun `Should return 401 for all public but protected paths`() {
        // When
        listOf(
            "/api/v1/authorization/management",
            "/api/v1/beacon_malfunctions/123",
        ).forEach {
            mockMvc.perform(
                get(it),
            )
                // Then
                .andExpect(status().isUnauthorized)
        }
    }

    @Test
    fun `Should return 401 for When deleting an user`() {
        // When
        listOf(
            "/api/v1/authorization/management/dummy@user.com",
        ).forEach {
            mockMvc.perform(
                delete(it),
            )
                // Then
                .andExpect(status().isUnauthorized)
        }
    }
}
