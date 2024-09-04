package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.SaveUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input.AddUserDataInput
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(SentryConfig::class)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(UserManagementController::class)])
class UserManagementControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var saveUser: SaveUser

    @MockBean
    private lateinit var deleteUser: DeleteUser

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should save an user`() {
        // When
        api.perform(
            post("/api/v1/authorization/management").content(
                objectMapper.writeValueAsString(AddUserDataInput("dummy@email.com", true)),
            ).contentType(MediaType.APPLICATION_JSON),
        )
            // Then
            .andExpect(status().isCreated)
    }

    @Test
    fun `Should delete an user`() {
        // When
        api.perform(delete("/api/v1/authorization/management/dummy@email.com"))
            // Then
            .andExpect(status().isOk)
    }
}
