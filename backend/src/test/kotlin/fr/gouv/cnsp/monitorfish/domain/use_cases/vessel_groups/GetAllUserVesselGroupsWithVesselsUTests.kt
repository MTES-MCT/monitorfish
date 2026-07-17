package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getFixedVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class GetAllUserVesselGroupsWithVesselsUTests {
    @MockitoBean
    private lateinit var getAllUserVesselGroups: GetAllUserVesselGroups

    @MockitoBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @Test
    fun `execute get all fixed groups with vessels from last positions`() {
        // Given
        given(
            getAllUserVesselGroups.execute(any()),
        ).willReturn(PriorityVesselGroup.PRIORITY_GROUPS + getFixedVesselGroups())
        given(lastPositionRepository.findActiveVesselWithReferentialData(any())).willReturn(
            TestUtils.getDummyLastPositions().map {
                EnrichedActiveVessel(
                    lastPosition = it,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(),
                    landingPort = null,
                )
            },
        )

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(getAllUserVesselGroups, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(4)

        assertThat((vesselGroups[2].group as FixedVesselGroup).vessels).hasSize(2)
        assertThat((vesselGroups[2].group as FixedVesselGroup).vessels.first().cfr).isEqualTo("FR123456785")
        assertThat((vesselGroups[2].group as FixedVesselGroup).vessels.last().cfr).isEqualTo("FR00022680")

        assertThat(vesselGroups[2].vessels).hasSize(2)

        val firstVessel = vesselGroups[2].vessels.first()
        assertThat(firstVessel.first).isEqualTo(0)
        assertThat(firstVessel.second.lastPosition?.internalReferenceNumber).isEqualTo("FR123456785")

        val lastVessel = vesselGroups[2].vessels.last()
        // VesselId is matched from the getDummyLastPositions() stub: FR00022680 -> FR224226850
        assertThat(lastVessel.second.lastPosition?.internalReferenceNumber).isEqualTo("FR224226850")
    }

    @Test
    fun `execute get all vessels ids when a vessel is not found`() {
        // Given
        val modifiedGroup =
            getFixedVesselGroups().first().copy(
                // Add unknown vessel
                vessels =
                    listOf(
                        VesselIdentity(
                            vesselId = null,
                            cfr = "NOT_FOUND",
                            name = null,
                            flagState = CountryCode.FR,
                            ircs = null,
                            externalIdentification = null,
                            vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                        ),
                    ) + getFixedVesselGroups().first().vessels,
            )
        given(getAllUserVesselGroups.execute(any())).willReturn(
            PriorityVesselGroup.PRIORITY_GROUPS + listOf(modifiedGroup),
        )
        given(lastPositionRepository.findActiveVesselWithReferentialData(any())).willReturn(
            TestUtils.getDummyLastPositions().map {
                EnrichedActiveVessel(
                    lastPosition = it,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(),
                    landingPort = null,
                )
            },
        )

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(getAllUserVesselGroups, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(3)
        assertThat(vesselGroups[2].vessels).hasSize(2)

        val firstVessel = vesselGroups[2].vessels.first()
        // Id is not 0 but 1 because first vessel is unknown
        assertThat(firstVessel.first).isEqualTo(1)
        assertThat(firstVessel.second.lastPosition?.internalReferenceNumber).isEqualTo("FR123456785")
    }

    @Test
    fun `execute correctly assigns vessels to priority groups based on control priority level`() {
        // Given
        given(getAllUserVesselGroups.execute(any())).willReturn(PriorityVesselGroup.PRIORITY_GROUPS)
        given(lastPositionRepository.findActiveVesselWithReferentialData(any())).willReturn(
            TestUtils.getDummyLastPositions().mapIndexed { index, position ->
                EnrichedActiveVessel(
                    lastPosition = position,
                    vesselProfile = null,
                    vessel = null,
                    producerOrganization = null,
                    riskFactor =
                        when (index) {
                            // effectiveControlPriorityLevel = controlPriorityLevel when speciesOnboard is not empty
                            0 ->
                                VesselRiskFactor(
                                    controlPriorityLevel = 4.0,
                                    speciesOnboard = listOf(Species(species = "COD")),
                                )
                            1 ->
                                VesselRiskFactor(
                                    controlPriorityLevel = 3.0,
                                    speciesOnboard = listOf(Species(species = "COD")),
                                )
                            else -> VesselRiskFactor()
                        },
                    landingPort = null,
                )
            },
        )

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(getAllUserVesselGroups, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then: only the two hardcoded priority groups (no user groups)
        assertThat(vesselGroups).hasSize(2)

        val p1 = vesselGroups[0]
        assertThat(p1.group.name).isEqualTo("Segments P1")
        assertThat(p1.vessels).hasSize(1)
        assertThat(
            p1.vessels
                .single()
                .second.lastPosition
                ?.internalReferenceNumber,
        ).isEqualTo("FR224226850")

        val p2 = vesselGroups[1]
        assertThat(p2.group.name).isEqualTo("Segments P2")
        assertThat(p2.vessels).hasSize(1)
        assertThat(
            p2.vessels
                .single()
                .second.lastPosition
                ?.internalReferenceNumber,
        ).isEqualTo("FR123456785")
    }

    @Test
    fun `execute get all dynamic groups with vessels from last positions`() {
        // Given
        given(getAllUserVesselGroups.execute(any())).willReturn(
            PriorityVesselGroup.PRIORITY_GROUPS + getDynamicVesselGroups(),
        )
        given(lastPositionRepository.findActiveVesselWithReferentialData(any())).willReturn(
            TestUtils.getDummyLastPositions().map {
                EnrichedActiveVessel(
                    lastPosition = it,
                    vesselProfile =
                        VesselProfile(
                            cfr = "",
                            segments =
                                it.segments?.associate { it to 0.985446 },
                            gears =
                                it.gearOnboard?.mapNotNull { it.gear }?.associate { it to 0.985446 },
                            species =
                                it.speciesOnboard?.mapNotNull { it.species }?.associate { it to 0.985446 },
                        ),
                    vessel = null,
                    producerOrganization = null,
                    riskFactor = VesselRiskFactor(riskFactor = 2.3),
                    landingPort = null,
                )
            },
        )

        // When
        val vesselGroups =
            GetAllVesselGroupsWithVessels(getAllUserVesselGroups, lastPositionRepository).execute(
                userEmail = "dummy@email.gouv.fr",
            )

        // Then
        assertThat(vesselGroups).hasSize(4)
        assertThat(vesselGroups.first().group.name).isEqualTo("Segments P1")
        assertThat(vesselGroups[1].group.name).isEqualTo("Segments P2")

        val firstVessel = vesselGroups[2].vessels.first()
        assertThat(firstVessel.second.lastPosition?.vesselId).isEqualTo(1)
        assertThat(firstVessel.second.lastPosition?.internalReferenceNumber).isEqualTo("FR224226850")
        // OTB is matching with the filter
        assertThat(
            firstVessel.second.lastPosition
                ?.gearOnboard
                ?.first()
                ?.gear,
        ).isEqualTo("OTB")
    }
}
