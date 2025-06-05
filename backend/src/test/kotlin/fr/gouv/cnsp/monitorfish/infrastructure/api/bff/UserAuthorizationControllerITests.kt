package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.utils.ApiTestWithJWTSecurity
import org.hamcrest.CoreMatchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ApiTestWithJWTSecurity(value = [(UserAuthorizationController::class)])
class UserAuthorizationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @Test
    fun `Should return 200 if the user is found`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "email",
                isSuperUser = true,
                service = null,
                isAdministrator = false,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/authorization/current")
                    .header("Authorization", "Bearer $VALID_JWT"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("EMAIL", "d44b8b1163276cb22a02d462de5883ceb60b461e20c4e27e905b72ec8b649807"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.isSuperUser", equalTo(true)))
    }

    @Test
    fun `Should return 401 if the user is not authorized`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(false)
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "email",
                isSuperUser = false,
                service = null,
                isAdministrator = false,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/authorization/current")
                    .header("Authorization", "Bearer $VALID_JWT"),
            )
            // Then
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `Should return 200 if the user is not found`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(getAuthorizedUser.execute(any())).willReturn(
            UserAuthorization(
                hashedEmail = "d44b8b1163276cb22a02d462de5883ceb60b461e20c4e27e905b72ec8b649807",
                isSuperUser = false,
                service = null,
                isAdministrator = false,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/authorization/current")
                    .header("Authorization", "Bearer $VALID_JWT"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(header().string("EMAIL", "d44b8b1163276cb22a02d462de5883ceb60b461e20c4e27e905b72ec8b649807"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.isSuperUser", equalTo(false)))
    }

    companion object {
        val VALID_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"
    }
}
