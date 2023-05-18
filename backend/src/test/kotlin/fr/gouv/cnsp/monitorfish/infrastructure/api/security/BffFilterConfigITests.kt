package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.config.ApiClient
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SuperUserAPIProperties
import fr.gouv.cnsp.monitorfish.config.WebSecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.infrastructure.api.VersionController
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.PortController
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(WebSecurityConfig::class, OIDCProperties::class, SuperUserAPIProperties::class, BffFilterConfig::class, ApiClient::class)
@WebMvcTest(
    value = [PortController::class, VersionController::class],
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
    private lateinit var getActivePorts: GetActivePorts

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var buildProperties: BuildProperties

    @Test
    fun `Should return 401 When the path is protected`() {
        // Given
        given(getActivePorts.execute()).willReturn(
            listOf(
                Port("ET", "Etel"),
                Port("AY", "Auray"),
            ),
        )
        given(getIsAuthorizedUser.execute(any())).willReturn(true)

        // When
        listOf(
            "/bff/v1/risk_factors"
        ).forEach {
            mockMvc.perform(get(it)
                .header("Authorization", "Bearer $VALID_JWT"),)
                // Then
                .andExpect(status().isUnauthorized)
        }
    }
}
