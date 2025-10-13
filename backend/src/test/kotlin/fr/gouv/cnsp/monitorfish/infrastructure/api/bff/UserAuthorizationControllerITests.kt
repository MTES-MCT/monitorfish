package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAuthorizedUser
import org.hamcrest.CoreMatchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(value = [(UserAuthorizationController::class)])
class UserAuthorizationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getAuthorizedUser: GetAuthorizedUser

    @Test
    fun `Should return 200 if the user is found`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "test@email.gouv.fr",
                isSuperUser = true,
                service = null,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/authorization/current")
                    .with(
                        oidcLogin()
                            .idToken { token ->
                                token.claim("email", "test@email.gouv.fr")
                            },
                    ),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.isSuperUser", equalTo(true)))
    }

    @Test
    fun `Should return 200 if the user is not a super user`() {
        // Given
        given(getAuthorizedUser.execute(any())).willReturn(
            AuthorizedUser(
                email = "test@email.gouv.fr",
                isSuperUser = false,
                service = null,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/authorization/current")
                    .with(
                        oidcLogin()
                            .idToken { token ->
                                token.claim("email", "test@email.gouv.fr")
                            },
                    ),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.isSuperUser", equalTo(false)))
    }
}
