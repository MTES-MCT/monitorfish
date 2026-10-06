package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.argThat
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.user_feedback.SendUserFeedback
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UserFeedbackDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UserFeedbackFileDataInput
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    MapperConfiguration::class,
)
@WebMvcTest(value = [UserFeedbackController::class])
class UserFeedbackControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockitoBean
    private lateinit var sendUserFeedback: SendUserFeedback

    @Test
    fun `Should send the user feedback with the authenticated user email`() {
        api
            .perform(
                post("/bff/v1/user_feedback")
                    .with(oidcLogin().idToken { token -> token.claim("email", "email@domain-name.com") })
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            UserFeedbackDataInput(message = "Bravo", pageUrl = "http://localhost/"),
                        ),
                    ),
            ).andExpect(status().isCreated)

        verify(sendUserFeedback).execute("Bravo", "email@domain-name.com", "http://localhost/", listOf())
    }

    @Test
    fun `Should send the user feedback with the decoded screenshots`() {
        api
            .perform(
                post("/bff/v1/user_feedback")
                    .with(oidcLogin().idToken { token -> token.claim("email", "email@domain-name.com") })
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            UserFeedbackDataInput(
                                message = "Voir la capture",
                                pageUrl = null,
                                files =
                                    listOf(
                                        UserFeedbackFileDataInput(
                                            content = "AQID",
                                            mimeType = "image/png",
                                            name = "capture.png",
                                        ),
                                    ),
                            ),
                        ),
                    ),
            ).andExpect(status().isCreated)

        verify(sendUserFeedback).execute(
            eq("Voir la capture"),
            eq("email@domain-name.com"),
            eq(null),
            argThat {
                single().let {
                    it.fileName == "capture.png" &&
                        it.mimeType == "image/png" &&
                        it.content.contentEquals(byteArrayOf(1, 2, 3))
                }
            },
        )
    }
}
