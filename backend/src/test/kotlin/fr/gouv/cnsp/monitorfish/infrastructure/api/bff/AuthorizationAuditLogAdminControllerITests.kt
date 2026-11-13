package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditAction
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizationAuditLog
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllAuthorizationAuditLogs
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(AuthorizationAuditLogAdminController::class)])
class AuthorizationAuditLogAdminControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllAuthorizationAuditLogs: GetAllAuthorizationAuditLogs

    @Test
    fun `Should return a page of the filtered authorization audit logs`() {
        // Given
        given(
            getAllAuthorizationAuditLogs.execute(
                AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
                "douane",
                0,
                50,
            ),
        ).willReturn(
            PaginatedList.new(
                items =
                    listOf(
                        AuthorizationAuditLog(
                            id = 1,
                            actorEmail = "dummy@email.gouv.fr",
                            action = AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
                            target = "DOUANE",
                            details = mapOf("addedEmails" to listOf("agent@douane.fr")),
                            createdAtUtc = ZonedDateTime.parse("2026-10-22T08:00:00Z"),
                        ),
                    ),
                pageNumber = 0,
                pageSize = 50,
                extraData = Unit,
            ),
        )

        // When
        api
            .perform(
                get("/bff/v1/admin/authorization_audit_logs")
                    .param("action", "REPLACE_ADMINISTRATION_USERS")
                    .param("searchQuery", "douane")
                    .param("pageNumber", "0")
                    .param("pageSize", "50"),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalLength", equalTo(1)))
            .andExpect(jsonPath("$.data[0].actorEmail", equalTo("dummy@email.gouv.fr")))
            .andExpect(jsonPath("$.data[0].action", equalTo("REPLACE_ADMINISTRATION_USERS")))
            .andExpect(jsonPath("$.data[0].target", equalTo("DOUANE")))
            .andExpect(jsonPath("$.data[0].details.addedEmails[0]", equalTo("agent@douane.fr")))
    }
}
