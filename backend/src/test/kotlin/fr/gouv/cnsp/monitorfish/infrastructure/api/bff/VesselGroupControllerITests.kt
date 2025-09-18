package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.given
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getCreateOrUpdateDynamicVesselGroups
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils.getCreateOrUpdateFixedVesselGroups
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetIsAuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos.VesselGroupWithVessels
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.DynamicVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.FixedVesselGroupDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(value = [(VesselGroupController::class)])
class VesselGroupControllerITests {
    @Autowired
    private lateinit var api: MockMvc

    @MockBean
    private lateinit var getIsAuthorizedUser: GetIsAuthorizedUser

    @MockBean
    private lateinit var addOrUpdateDynamicVesselGroup: AddOrUpdateDynamicVesselGroup

    @MockBean
    private lateinit var addOrUpdateFixedVesselGroup: AddOrUpdateFixedVesselGroup

    @MockBean
    private lateinit var getAllVesselGroups: GetAllVesselGroups

    @MockBean
    private lateinit var getAllVesselGroupsWithVessels: GetAllVesselGroupsWithVessels

    @MockBean
    private lateinit var deleteVesselGroup: DeleteVesselGroup

    @MockBean
    private lateinit var deleteFixedVesselGroupVessel: DeleteFixedVesselGroupVessel

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private fun authenticatedRequest() =
        oidcLogin()
            .idToken { token ->
                token.claim("email", "email@domain-name.com")
            }

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
                sharedTo = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR, CountryCode.ES, CountryCode.IT),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlAtQuayPeriod = LastControlPeriod.BEFORE_SIX_MONTHS_AGO,
                        lastControlAtSeaPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            )
        given(
            addOrUpdateDynamicVesselGroup.execute(any(), any()),
        ).willReturn(TestUtils.getDynamicVesselGroups().first())

        // When
        api
            .perform(
                post("/bff/v1/vessel_groups/dynamic")
                    .with(authenticatedRequest())
                    .with(csrf())
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
    fun `Should save a fixed vessel group`() {
        // Given
        val groupToSave =
            FixedVesselGroupDataInput(
                id = null,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                sharedTo = null,
                endOfValidityUtc = null,
                startOfValidityUtc = null,
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "FR123456785",
                            name = "MY AWESOME VESSEL TWO",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                        VesselIdentity(
                            vesselId = 1,
                            cfr = "FR00022680",
                            name = "MY AWESOME VESSEL",
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = null,
                        ),
                    ),
            )
        given(
            addOrUpdateFixedVesselGroup.execute(any(), any()),
        ).willReturn(TestUtils.getFixedVesselGroups().first())

        // When
        api
            .perform(
                post("/bff/v1/vessel_groups/fixed")
                    .with(authenticatedRequest())
                    .with(csrf())
                    .content(objectMapper.writeValueAsString(groupToSave))
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name", equalTo("Mission Thémis – chaluts de fonds")))

        Mockito
            .verify(
                addOrUpdateFixedVesselGroup,
            ).execute("email@domain-name.com", getCreateOrUpdateFixedVesselGroups().first().copy(id = null))
    }

    @Test
    fun `Should get all dynamic vessel groups`() {
        // Given
        given(getAllVesselGroups.execute(any())).willReturn(TestUtils.getDynamicVesselGroups())

        // When
        api
            .perform(
                get("/bff/v1/vessel_groups")
                    .with(authenticatedRequest())
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].name", equalTo("Mission Thémis – chaluts de fonds")))
            .andExpect(jsonPath("$[0].filters.hasLogbook", equalTo(true)))
            .andExpect(jsonPath("$[0].filters.countryCodes", equalTo(listOf("FR", "ES", "IT"))))

        Mockito.verify(getAllVesselGroups).execute("email@domain-name.com")
    }

    @Test
    fun `Should get all vessel groups with vessels`() {
        // Given
        given(getAllVesselGroupsWithVessels.execute(any())).willReturn(
            TestUtils.getDynamicVesselGroups().map {
                VesselGroupWithVessels(
                    group = it,
                    vessels = listOf(),
                )
            },
        )

        // When
        api
            .perform(
                get("/bff/v1/vessel_groups/vessels")
                    .with(authenticatedRequest())
                    .contentType(MediaType.APPLICATION_JSON),
            )
            // Then
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()", equalTo(2)))
            .andExpect(jsonPath("$[0].group.name", equalTo("Mission Thémis – chaluts de fonds")))

        Mockito.verify(getAllVesselGroupsWithVessels).execute("email@domain-name.com")
    }

    @Test
    fun `Should delete a dynamic vessel groups`() {
        // When
        api
            .perform(
                delete("/bff/v1/vessel_groups/123")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isNoContent)

        Mockito.verify(deleteVesselGroup).execute(userEmail = "email@domain-name.com", id = 123)
    }

    @Test
    fun `Should delete a vessel from a vessel groups`() {
        // When
        api
            .perform(
                delete("/bff/v1/vessel_groups/123/1")
                    .with(authenticatedRequest())
                    .with(csrf()),
            )
            // Then
            .andExpect(status().isNoContent)

        Mockito.verify(deleteFixedVesselGroupVessel).execute(
            userEmail = "email@domain-name.com",
            groupId = 123,
            vesselIndex = 1,
        )
    }
}
