package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.*
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyMissionAction(
        dateTime: ZonedDateTime,
        id: Int? = null,
    ) = MissionAction(
        id = id,
        actionDatetimeUtc = dateTime,
        missionId = 2,
        vesselId = 2,
        internalReferenceNumber = "FR0564654",
        externalReferenceNumber = "FDEY874",
        ircs = "FDZFEE",
        flagState = CountryCode.FR,
        actionType = MissionActionType.SEA_CONTROL,
        flightGoals =
            listOf(
                FlightGoal.CLOSED_AREA,
                FlightGoal.UNAUTHORIZED_FISHING,
            ),
        emitsVms = ControlCheck.YES,
        emitsAis = ControlCheck.NOT_APPLICABLE,
        logbookMatchesActivity = ControlCheck.NO,
        speciesWeightControlled = true,
        speciesSizeControlled = true,
        separateStowageOfPreservedSpecies = ControlCheck.YES,
        infractions =
            listOf(
                Infraction(
                    InfractionType.WITH_RECORD,
                    27689,
                    "Poids à bord MNZ supérieur de 50% au poids déclaré",
                ),
                Infraction(
                    InfractionType.WITH_RECORD,
                    27689,
                    "Maille trop petite",
                ),
            ),
        faoAreas = listOf("25.6.9", "25.7.9"),
        segments =
            listOf(
                FleetSegment(
                    segment = "WWSS10",
                    segmentName = "World Wide Segment",
                ),
            ),
        controlQualityComments = "Ciblage CNSP respecté",
        userTrigram = "DEF",
        facade = "NAMO",
        longitude = -6.56,
        latitude = 45.12,
        isDeleted = false,
        hasSomeGearsSeized = false,
        hasSomeSpeciesSeized = false,
        completedBy = "XYZ",
        completion = Completion.TO_COMPLETE,
        isFromPoseidon = true,
        isAdministrativeControl = true,
        isComplianceWithWaterRegulationsControl = true,
        isSafetyEquipmentAndStandardsComplianceControl = true,
        isSeafarersControl = true,
    )

    fun getDynamicVesselGroups() =
        listOf(
            DynamicVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC),
                updatedAtUtc = null,
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(CountryCode.FR, CountryCode.ES, CountryCode.IT),
                        districtCodes = listOf(),
                        fleetSegments = emptyList(),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlAtSeaPeriod = null,
                        lastControlAtQuayPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            ),
            DynamicVesselGroup(
                id = 2,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention = null,
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC).minusMonths(1),
                updatedAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC),
                endOfValidityUtc = null,
                filters =
                    VesselGroupFilters(
                        countryCodes = listOf(),
                        districtCodes = listOf(),
                        fleetSegments = listOf("PEL13"),
                        gearCodes = listOf("OTB", "OTM", "TBB", "PTB"),
                        hasLogbook = true,
                        lastControlAtSeaPeriod = LastControlPeriod.BEFORE_ONE_YEAR_AGO,
                        lastControlAtQuayPeriod = null,
                        landingPortLocodes = emptyList(),
                        lastPositionHoursAgo = null,
                        producerOrganizations = emptyList(),
                        riskFactors = listOf(2, 3),
                        specyCodes = emptyList(),
                        vesselSize = VesselSize.ABOVE_TWELVE_METERS,
                        vesselsLocation = listOf(VesselLocation.SEA),
                        zones = emptyList(),
                    ),
            ),
        )

    fun getFixedVesselGroups() =
        listOf(
            FixedVesselGroup(
                id = 1,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention =
                    "Points d'attention : Si le navire X est dans le secteur, le contrôler pour " +
                        "suspicion blanchiment bar en 7.d.",
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC),
                updatedAtUtc = null,
                endOfValidityUtc = null,
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
            ),
            FixedVesselGroup(
                id = 2,
                isDeleted = false,
                name = "Mission Thémis – chaluts de fonds",
                description = "Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.",
                pointsOfAttention = null,
                color = "#4287f5",
                sharing = Sharing.PRIVATE,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC).minusMonths(1),
                updatedAtUtc = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC),
                endOfValidityUtc = null,
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
            ),
        )
}
