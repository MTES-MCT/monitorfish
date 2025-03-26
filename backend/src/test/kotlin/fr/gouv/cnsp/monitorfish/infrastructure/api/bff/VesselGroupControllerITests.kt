package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.ProtectedPathsAPIProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getCreateOrUpdateDynamicVesselGroups
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.AddOrUpdateDynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.DeleteVesselGroup
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllVesselGroups
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.DynamicVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.log.CustomAuthenticationEntryPoint
import fr.gouv.cnsp.monitorfish.infrastructure.api.security.UserAuthorizationCheckFilter
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.oidc.APIOIDCRepository
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Import(
    SecurityConfig::class,
    OIDCProperties::class,
    ProtectedPathsAPIProperties::class,
    UserAuthorizationCheckFilter::class,
    SentryConfig::class,
    CustomAuthenticationEntryPoint::class,
    APIOIDCRepository::class,
    TestApiClient::class,
)
@WebMvcTest(
    value = [(VesselGroupController::class)],
    properties = [
        "monitorfish.oidc.enabled=true",
        "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        "monitorfish.oidc.userinfo-endpoint=/api/user",
        "monitorfish.oidc.issuer-uri=http://issuer-uri.gouv.fr",
    ],
)
class VesselGroupControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @Autowired
    private lateinit var jwtDecoder: JwtDecoder

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var addOrUpdateDynamicVesselGroup: AddOrUpdateDynamicVesselGroup

    @MockBean
    private lateinit var getAllVesselGroups: GetAllVesselGroups

    @MockBean
    private lateinit var deleteVesselGroup: DeleteVesselGroup

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `Should save a dynamic vessel group`() {
        // Given
        val groupToSave =
            DynamicVesselGroupDataInput(
                id = null,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf("FR", "ES", "IT"),
                        fleetSegments = emptyList(),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlPeriod = LastControlPeriod.BEFORE_SIX_MONTHS_AGO,
                        lastLandingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            )
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(
            addOrUpdateDynamicVesselGroup.execute(any(), any()),
        ).willReturn(TestUtils.getDynamicVesselGroups().first())

        // When
        api
            .perform(
                post("/bff/v1/vessel_groups")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}")
                    .content(objectMapper.writeValueAsString(groupToSave))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name", equalTo("Mission Thémis – chaluts de fonds")))

        Mockito
            .verify(
                addOrUpdateDynamicVesselGroup,
            ).execute("email@domain-name.com", getCreateOrUpdateDynamicVesselGroups().first().copy(id = null))
    }

    @Test
    fun `Should get all dynamic vessel groups`() {
        // Given
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)
        given(getAllVesselGroups.execute(any())).willReturn(TestUtils.getDynamicVesselGroups())

        // When
        api
            .perform(
                get("/bff/v1/vessel_groups")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}")
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].name", equalTo("Mission Thémis – chaluts de fonds")))
            .andExpect(jsonPath("$[0].filters.hasLogbook", equalTo(true)))

        Mockito.verify(getAllVesselGroups).execute("email@domain-name.com")
    }

    @Test
    fun `Should delete a dynamic vessel groups`() {
        given(getIsAuthorizedUser.execute(any(), any())).willReturn(true)

        // When
        api
            .perform(
                delete("/bff/v1/vessel_groups/123")
                    .header("Authorization", "Bearer ${UserAuthorizationControllerITests.VALID_JWT}"),
            )
            // Then
            .andExpect(status().isNoContent)

        Mockito.verify(deleteVesselGroup).execute("email@domain-name.com", 123)
    }
}
