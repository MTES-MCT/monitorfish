package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.AddAuthorizedOrganizationalUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteAuthorizedOrganizationalUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllAuthorizedOrganizationalUnits
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AuthorizedOrganizationalUnitDataInput
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [(AuthorizedOrganizationalUnitAdminController::class)])
class AuthorizedOrganizationalUnitAdminControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockitoBean
    private lateinit var getAllAuthorizedOrganizationalUnits: GetAllAuthorizedOrganizationalUnits

    @MockitoBean
    private lateinit var addAuthorizedOrganizationalUnit: AddAuthorizedOrganizationalUnit

    @MockitoBean
    private lateinit var deleteAuthorizedOrganizationalUnit: DeleteAuthorizedOrganizationalUnit

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should return all authorized organizational units`() {
        // Given
        given(getAllAuthorizedOrganizationalUnits.execute()).willReturn(listOf("DAM/DPMA"))

        // When
        api
            .perform(get("/bff/v1/admin/authorized_organizational_units"))
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0]", equalTo("DAM/DPMA")))
    }

    @Test
    fun `Should add an authorized organizational unit`() {
        // When
        api
            .perform(
                post("/bff/v1/admin/authorized_organizational_units")
                    .content(objectMapper.writeValueAsString(AuthorizedOrganizationalUnitDataInput("DAM/DIRM MEMN")))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isCreated)

        verify(addAuthorizedOrganizationalUnit).execute("DAM/DIRM MEMN")
    }

    @Test
    fun `Should delete an authorized organizational unit`() {
        // When
        api
            .perform(delete("/bff/v1/admin/authorized_organizational_units").param("organizationalUnit", "DAM/DPMA"))
            // Then
            .andExpect(status().isOk)

        verify(deleteAuthorizedOrganizationalUnit).execute("DAM/DPMA")
    }
}
