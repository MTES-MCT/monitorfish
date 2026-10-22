package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.AddUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteUserByHashedEmail
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllUsers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.ReplaceAdministrationUsers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.ReplacedAdministrationUsers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.UpdateUserIsAdministrator
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddUserAdminDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ReplaceAdministrationUsersDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateUserIsAdministratorDataInput
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(UserAdminController::class)])
class UserAdminControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllUsers: GetAllUsers

    @MockitoBean
    private lateinit var addUser: AddUser

    @MockitoBean
    private lateinit var replaceAdministrationUsers: ReplaceAdministrationUsers

    @MockitoBean
    private lateinit var updateUserIsAdministrator: UpdateUserIsAdministrator

    @MockitoBean
    private lateinit var deleteUserByHashedEmail: DeleteUserByHashedEmail

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should return all users`() {
        // Given
        given(getAllUsers.execute()).willReturn(
            listOf(
                UserAuthorization(
                    hashedEmail = "abc",
                    email = "another@email.com",
                    isSuperUser = false,
                    service = CnspService.POLE_SIP,
                    isAdministrator = false,
                    administration = ExternalAdministration.DOUANE,
                ),
            ),
        )

        // When
        api
            .perform(get("/bff/v1/admin/users"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].email", equalTo("another@email.com")))
            .andExpect(jsonPath("$[0].service", equalTo("Pôle SIP")))
            .andExpect(jsonPath("$[0].administration", equalTo("DOUANE")))
    }

    @Test
    fun `Should add a user`() {
        // When
        api
            .perform(
                post("/bff/v1/admin/users")
                    .content(
                        objectMapper.writeValueAsString(
                            AddUserAdminDataInput(
                                email = "agent@email.gouv.fr",
                                isSuperUser = true,
                                service = CnspService.POLE_SIP,
                            ),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)

        verify(addUser).execute("agent@email.gouv.fr", true, false, CnspService.POLE_SIP, null, null)
    }

    @Test
    fun `Should replace the users of an administration`() {
        // Given
        given(
            replaceAdministrationUsers.execute(
                ExternalAdministration.GENDARMERIE_MARITIME,
                listOf("added@gendarmerie.fr"),
                false,
                null,
            ),
        ).willReturn(
            ReplacedAdministrationUsers(
                addedEmails = listOf("added@gendarmerie.fr"),
                movedEmails = listOf(),
                removedEmails = listOf("another@email.com"),
                ignoredSuperUserEmails = listOf(),
            ),
        )

        // When
        api
            .perform(
                put("/bff/v1/admin/users/administrations/GENDARMERIE_MARITIME")
                    .content(
                        objectMapper.writeValueAsString(
                            ReplaceAdministrationUsersDataInput(listOf("added@gendarmerie.fr")),
                        ),
                    ).contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.addedEmails[0]", equalTo("added@gendarmerie.fr")))
            .andExpect(jsonPath("$.removedEmails[0]", equalTo("another@email.com")))
    }

    @Test
    fun `Should update the administrator rights of a user`() {
        // When
        api
            .perform(
                put("/bff/v1/admin/users/abc/administrator")
                    .content(objectMapper.writeValueAsString(UpdateUserIsAdministratorDataInput(true)))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)

        verify(updateUserIsAdministrator).execute("abc", true, null)
    }

    @Test
    fun `Should delete a user by its hashed email`() {
        // When
        api
            .perform(delete("/bff/v1/admin/users/abc"))
            // Then
            .andExpect(status().isOk)

        verify(deleteUserByHashedEmail).execute("abc", null)
    }
}
