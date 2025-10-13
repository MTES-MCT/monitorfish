package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.TestUtils.DUMMY_POSITION_ALERT
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(MapperConfiguration::class)
@WebMvcTest(value = [PositionAlertSpecificationController::class])
class PositionAlertSpecificationControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var getPositionAlertSpecifications: GetPositionAlertSpecifications

    @MockBean
    private lateinit var activateOrDeactivateAlertSpecification: ActivateOrDeactivateAlertSpecification

    @MockBean
    private lateinit var deleteAlertSpecification: DeleteAlertSpecification

    @MockBean
    private lateinit var addPositionAlertSpecification: AddPositionAlertSpecification

    @MockBean
    private lateinit var updatePositionAlertSpecification: UpdatePositionAlertSpecification

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun authenticatedRequest() =
        oidcLogin()
            .idToken { token ->
                token.claim("email", "email@domain-name.com")
            }

    @Test
    fun `Should get all position alerts`() {
        // Given
        given(getPositionAlertSpecifications.execute()).willReturn(
            listOf(DUMMY_POSITION_ALERT),
        )
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                get("/bff/v1/position_alerts_specs")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(1)))
            .andExpect(jsonPath("$[0].name", equalTo("Chalutage dans les 3 milles")))
            .andExpect(jsonPath("$[0].type", equalTo("POSITION_ALERT")))
    }

    @Test
    fun `Should activate an alert specification`() {
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                put("/bff/v1/position_alerts_specs/123/activate")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(activateOrDeactivateAlertSpecification).execute(123, true)
    }

    @Test
    fun `Should deactivate an alert specification`() {
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                put("/bff/v1/position_alerts_specs/456/deactivate")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(activateOrDeactivateAlertSpecification).execute(456, false)
    }

    @Test
    fun `Should delete an alert specification`() {
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                delete("/bff/v1/position_alerts_specs/789")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(deleteAlertSpecification).execute(789)
    }

    @Test
    fun `Should create an alert specification`() {
        // Given
        val userEmail = "email@domain-name.com"
        val alertSpecificationJson =
            """
            {
                "name": "Test Alert",
                "type": "POSITION_ALERT",
                "description": "Test alert description",
                "natinfCode": 7059,
                "hasAutomaticArchiving": false,
                "repeatEachYear": false,
                "trackAnalysisDepth": 8.0,
                "onlyFishingPositions": true,
                "gears": [],
                "species": [],
                "speciesCatchAreas": [],
                "administrativeAreas": [],
                "regulatoryAreas": [],
                "flagStatesIso2": [],
                "vesselIds": [],
                "districtCodes": [],
                "producerOrganizations": []
            }
            """.trimIndent()
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                post("/bff/v1/position_alerts_specs")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(alertSpecificationJson),
            )
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(addPositionAlertSpecification).execute(
            eq(userEmail),
            argThat { alertSpec ->
                alertSpec.name == "Test Alert" &&
                    alertSpec.type == "POSITION_ALERT" &&
                    alertSpec.description == "Test alert description" &&
                    alertSpec.natinfCode == 7059 &&
                    alertSpec.isUserDefined &&
                    !alertSpec.hasAutomaticArchiving &&
                    !alertSpec.repeatEachYear &&
                    alertSpec.trackAnalysisDepth == 8.0 &&
                    alertSpec.onlyFishingPositions
            },
        )
    }

    @Test
    fun `Should update an alert specification`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        val alertId = 123
        val alertSpecificationJson =
            """
            {
                "name": "Updated Alert",
                "type": "POSITION_ALERT",
                "description": "Updated alert description",
                "natinfCode": 7060,
                "isActivated": false,
                "repeatEachYear": true,
                "trackAnalysisDepth": 15.0,
                "onlyFishingPositions": false,
                "gears": [],
                "species": [],
                "speciesCatchAreas": [],
                "administrativeAreas": [],
                "regulatoryAreas": [],
                "flagStatesIso2": [],
                "vesselIds": [],
                "districtCodes": [],
                "producerOrganizations": []
            }
            """.trimIndent()

        // When
        api
            .perform(
                put("/bff/v1/position_alerts_specs/$alertId")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(alertSpecificationJson),
            )
            // Then
            .andExpect(status().isOk)

        // Verify
        verify(updatePositionAlertSpecification).execute(
            eq(alertId),
            argThat { alertSpec ->
                alertSpec.name == "Updated Alert" &&
                    alertSpec.type == "POSITION_ALERT" &&
                    alertSpec.description == "Updated alert description" &&
                    alertSpec.natinfCode == 7060 &&
                    !alertSpec.isActivated &&
                    alertSpec.isUserDefined &&
                    !alertSpec.hasAutomaticArchiving &&
                    alertSpec.repeatEachYear &&
                    alertSpec.trackAnalysisDepth == 15.0 &&
                    !alertSpec.onlyFishingPositions
            },
        )
    }
}
