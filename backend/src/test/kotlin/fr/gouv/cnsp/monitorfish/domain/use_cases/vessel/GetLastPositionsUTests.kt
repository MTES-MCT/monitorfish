package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import com.neovisionaries.i18n.CountryCode
import com.nhaarman.mockitokotlin2.any
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselGroupRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.TestUtils.getDynamicVesselGroups
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.mockito.BDDMockito.given
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.ZonedDateTime

@ExtendWith(SpringExtension::class)
class GetLastPositionsUTests {
    @MockBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockBean
    private lateinit var vesselGroupRepository: VesselGroupRepository

    @Test
    fun `execute Should return last positions with groups When multiple group conditions matches`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(TestUtils.getDummyLastPositions().first()),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            getDynamicVesselGroups(),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Mission Thémis – chaluts de fonds")
    }

    @Test
    fun `execute Should return last positions with groups When flag state match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = listOf(CountryCode.FR),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When fleet segment match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    segments = listOf("NWW03", "NWW06"),
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = listOf("NWW03"),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When gear match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    gearOnboard =
                        listOf(
                            Gear().apply {
                                this.gear = "OTB"
                            },
                        ),
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = listOf("OTB"),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When has logbook match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    lastLogbookMessageDateTime = ZonedDateTime.now(),
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = true,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When last position match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now().minusHours(2),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = 3,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When risk factor match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = listOf(2),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When species match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    speciesOnboard =
                        listOf(
                            Species().apply {
                                this.species = "AMZ"
                            },
                            Species().apply {
                                this.species = "HKE"
                            },
                        ),
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = listOf("HKE"),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When vessel size match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    length = 15.2,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When vessel location match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = listOf(VesselLocation.PORT),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When zone match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    latitude = 45.8543093,
                    longitude = -8.8558547,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        val polygon =
            GeometryFactory().createPolygon(
                listOf(
                    Coordinate(-10.8558547, 53.3543093),
                    Coordinate(-5.8558547, 45.3543093),
                    Coordinate(-8.8558547, 40.3543093),
                    Coordinate(-10.8558547, 53.3543093),
                ).toTypedArray(),
            )

        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones =
                                listOf(
                                    ZoneFilter(
                                        feature = polygon,
                                        label = "Zone manuelle",
                                        value = "custom",
                                    ),
                                ),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions without groups When vessel district code not match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    districtCode = "LO",
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf("GV"),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        assertThat(lastPositions[0].vesselGroups).hasSize(0)
    }

    @Test
    fun `execute Should return last positions with groups When vessel district code match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    districtCode = "GV",
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = listOf("GV"),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = null,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When vessel Last Control Period match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    lastControlDateTime = ZonedDateTime.now().minusYears(2),
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = emptyList(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = LastControlPeriod.BEFORE_ONE_YEAR_AGO,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        val vesselGroups = lastPositions[0].vesselGroups.map { it.name }
        assertThat(vesselGroups).contains("Dummy group")
    }

    @Test
    fun `execute Should return last positions with groups When vessel Last Control Period does not match`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            listOf(
                LastPosition(
                    flagState = CountryCode.FR,
                    positionType = PositionType.AIS,
                    lastControlDateTime = ZonedDateTime.now().minusYears(2),
                    latitude = 16.445,
                    longitude = 48.2525,
                    riskFactor = 2.23,
                    dateTime = ZonedDateTime.now(),
                    isAtPort = true,
                    vesselIdentifier = VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
                ),
            ),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            listOf(
                DynamicVesselGroup(
                    id = 1,
                    isDeleted = false,
                    name = "Dummy group",
                    description = "",
                    pointsOfAttention = "",
                    color = "",
                    sharing = Sharing.PRIVATE,
                    createdBy = "dummy@email.gouv.fr",
                    createdAtUtc = ZonedDateTime.now(),
                    updatedAtUtc = null,
                    endOfValidityUtc = null,
                    filters =
                        VesselGroupFilters(
                            countryCodes = emptyList(),
                            districtCodes = emptyList(),
                            fleetSegments = emptyList(),
                            gearCodes = emptyList(),
                            hasLogbook = null,
                            lastControlPeriod = LastControlPeriod.AFTER_ONE_MONTH_AGO,
                            lastLandingPortLocodes = emptyList(),
                            lastPositionHoursAgo = null,
                            producerOrganizations = emptyList(),
                            riskFactors = emptyList(),
                            specyCodes = emptyList(),
                            vesselSize = null,
                            vesselsLocation = emptyList(),
                            zones = emptyList(),
                        ),
                ),
            ),
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(1)
        assertThat(lastPositions[0].vesselGroups).hasSize(0)
    }

    @Test
    fun `execute Should return vessels without groups When no matching groups for user`() {
        // Given
        given(lastPositionRepository.findAllInLastMonthOrWithBeaconMalfunction()).willReturn(
            TestUtils.getDummyLastPositions(),
        )
        given(vesselGroupRepository.findAllByUser(any())).willReturn(
            emptyList(), // No groups found for the user
        )

        // When
        val lastPositions =
            GetLastPositions(lastPositionRepository, vesselGroupRepository)
                .execute("DUMMY_EMAIL")

        // Then
        assertThat(lastPositions).hasSize(4)
        lastPositions.forEach { position ->
            assertThat(position.vesselGroups).isEmpty() // No groups should be attached to the vessels
        }
    }
}
