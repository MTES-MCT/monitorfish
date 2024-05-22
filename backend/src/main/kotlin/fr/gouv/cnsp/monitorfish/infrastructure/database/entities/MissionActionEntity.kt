package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.*
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.annotations.Type
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "mission_actions")
class MissionActionEntity(
    @Id
    @SequenceGenerator(name = "mission_actions_id_seq", sequenceName = "mission_actions_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mission_actions_id_seq")
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "vessel_id")
    val vesselId: Int? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    @Column(name = "cfr")
    val internalReferenceNumber: String? = null,
    @Column(name = "external_immatriculation")
    val externalReferenceNumber: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "flag_state")
    val flagState: String? = null,
    @Column(name = "district_code")
    val districtCode: String? = null,
    @Column(name = "flight_goals", columnDefinition = "varchar(100)[]")
    val flightGoals: List<String>? = listOf(),
    @Column(name = "fao_areas", columnDefinition = "varchar(100)[]")
    val faoAreas: List<String>? = listOf(),
    @Column(name = "mission_id")
    val missionId: Int,
    @Column(name = "action_type")
    @Enumerated(EnumType.STRING)
    val actionType: MissionActionType,
    @Column(name = "action_datetime_utc")
    val actionDatetimeUtc: Instant,
    @Column(name = "emits_vms")
    @Enumerated(EnumType.STRING)
    val emitsVms: ControlCheck? = null,
    @Column(name = "emits_ais")
    @Enumerated(EnumType.STRING)
    val emitsAis: ControlCheck? = null,
    @Column(name = "logbook_matches_activity")
    @Enumerated(EnumType.STRING)
    val logbookMatchesActivity: ControlCheck? = null,
    @Column(name = "licences_match_activity")
    @Enumerated(EnumType.STRING)
    val licencesMatchActivity: ControlCheck? = null,
    @Column(name = "species_weight_controlled")
    val speciesWeightControlled: Boolean? = null,
    @Column(name = "species_size_controlled")
    val speciesSizeControlled: Boolean? = null,
    @Column(name = "separate_stowage_of_preserved_species")
    @Enumerated(EnumType.STRING)
    val separateStowageOfPreservedSpecies: ControlCheck? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "logbook_infractions", columnDefinition = "jsonb")
    val logbookInfractions: String? = null,
    @Column(name = "licences_and_logbook_observations")
    val licencesAndLogbookObservations: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_infractions", columnDefinition = "jsonb")
    val gearInfractions: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species_infractions", columnDefinition = "jsonb")
    val speciesInfractions: String? = null,
    @Column(name = "species_observations")
    val speciesObservations: String? = null,
    @Column(name = "seizure_and_diversion")
    val seizureAndDiversion: Boolean? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "other_infractions", columnDefinition = "jsonb")
    val otherInfractions: String? = null,
    @Column(name = "number_of_vessels_flown_over")
    val numberOfVesselsFlownOver: Int? = null,
    @Column(name = "unit_without_omega_gauge")
    val unitWithoutOmegaGauge: Boolean? = null,
    @Column(name = "control_quality_comments")
    val controlQualityComments: String? = null,
    @Column(name = "feedback_sheet_required")
    val feedbackSheetRequired: Boolean? = null,
    @Column(name = "is_from_poseidon")
    val isFromPoseidon: Boolean,
    @Column(name = "user_trigram")
    val userTrigram: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "segments", columnDefinition = "jsonb")
    val segments: String? = null,
    @Column(name = "facade", columnDefinition = "facade")
    val facade: String? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "port_locode")
    val portLocode: String? = null,
    @Column(name = "vessel_targeted")
    @Enumerated(EnumType.STRING)
    val vesselTargeted: ControlCheck? = null,
    @Column(name = "seizure_and_diversion_comments")
    val seizureAndDiversionComments: String? = null,
    @Column(name = "other_comments")
    val otherComments: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_onboard", columnDefinition = "jsonb")
    val gearOnboard: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species_onboard", columnDefinition = "jsonb")
    val speciesOnboard: String? = null,
    @Column(name = "is_deleted")
    val isDeleted: Boolean,
    @Column(name = "has_some_gears_seized")
    val hasSomeGearsSeized: Boolean,
    @Column(name = "has_some_species_seized")
    val hasSomeSpeciesSeized: Boolean,
    @Column(name = "completed_by")
    val completedBy: String? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    @Column(name = "completion", columnDefinition = "mission_action_completion")
    val completion: Completion,
    @Column(name = "is_administrative_control")
    val isAdministrativeControl: Boolean? = null,
    @Column(name = "is_compliance_with_water_regulations_control")
    val isComplianceWithWaterRegulationsControl: Boolean? = null,
    @Column(name = "is_safety_equipment_and_standards_compliance_control")
    val isSafetyEquipmentAndStandardsComplianceControl: Boolean? = null,
    @Column(name = "is_seafarers_control")
    val isSeafarersControl: Boolean? = null,
) {

    companion object {
        fun fromMissionAction(
            mapper: ObjectMapper,
            missionAction: MissionAction,
        ): MissionActionEntity =
            MissionActionEntity(
                id = missionAction.id,
                missionId = missionAction.missionId,
                vesselId = missionAction.vesselId,
                vesselName = missionAction.vesselName,
                internalReferenceNumber = missionAction.internalReferenceNumber,
                externalReferenceNumber = missionAction.externalReferenceNumber,
                ircs = missionAction.ircs,
                flagState = missionAction.flagState,
                districtCode = missionAction.districtCode,
                faoAreas = missionAction.faoAreas,
                flightGoals = missionAction.flightGoals.map { it.value },
                actionType = missionAction.actionType,
                actionDatetimeUtc = missionAction.actionDatetimeUtc.toInstant(),
                emitsVms = missionAction.emitsVms,
                emitsAis = missionAction.emitsAis,
                logbookMatchesActivity = missionAction.logbookMatchesActivity,
                licencesMatchActivity = missionAction.licencesMatchActivity,
                speciesWeightControlled = missionAction.speciesWeightControlled,
                speciesSizeControlled = missionAction.speciesSizeControlled,
                separateStowageOfPreservedSpecies = missionAction.separateStowageOfPreservedSpecies,
                logbookInfractions = mapper.writeValueAsString(missionAction.logbookInfractions),
                licencesAndLogbookObservations = missionAction.licencesAndLogbookObservations,
                gearInfractions = mapper.writeValueAsString(missionAction.gearInfractions),
                speciesInfractions = mapper.writeValueAsString(missionAction.speciesInfractions),
                speciesObservations = missionAction.speciesObservations,
                seizureAndDiversion = missionAction.seizureAndDiversion,
                otherInfractions = mapper.writeValueAsString(missionAction.otherInfractions),
                numberOfVesselsFlownOver = missionAction.numberOfVesselsFlownOver,
                unitWithoutOmegaGauge = missionAction.unitWithoutOmegaGauge,
                controlQualityComments = missionAction.controlQualityComments,
                feedbackSheetRequired = missionAction.feedbackSheetRequired,
                userTrigram = missionAction.userTrigram,
                segments = mapper.writeValueAsString(missionAction.segments),
                facade = missionAction.facade?.let { Seafront.from(it).toString() },
                longitude = missionAction.longitude,
                latitude = missionAction.latitude,
                portLocode = missionAction.portLocode,
                vesselTargeted = missionAction.vesselTargeted,
                seizureAndDiversionComments = missionAction.seizureAndDiversionComments,
                otherComments = missionAction.otherComments,
                gearOnboard = mapper.writeValueAsString(missionAction.gearOnboard),
                speciesOnboard = mapper.writeValueAsString(missionAction.speciesOnboard),
                isFromPoseidon = missionAction.isFromPoseidon,
                isDeleted = missionAction.isDeleted,
                hasSomeGearsSeized = missionAction.hasSomeGearsSeized,
                hasSomeSpeciesSeized = missionAction.hasSomeSpeciesSeized,
                completedBy = missionAction.completedBy,
                completion = missionAction.completion,
                isAdministrativeControl = missionAction.isAdministrativeControl,
                isComplianceWithWaterRegulationsControl = missionAction.isComplianceWithWaterRegulationsControl,
                isSafetyEquipmentAndStandardsComplianceControl = missionAction.isSafetyEquipmentAndStandardsComplianceControl,
                isSeafarersControl = missionAction.isSeafarersControl,
            )
    }

    fun toMissionAction(mapper: ObjectMapper) =
        MissionAction(
            id = id,
            missionId = missionId,
            vesselId = vesselId,
            vesselName = vesselName,
            internalReferenceNumber = internalReferenceNumber,
            externalReferenceNumber = externalReferenceNumber,
            ircs = ircs,
            flagState = flagState,
            districtCode = districtCode,
            faoAreas = faoAreas ?: listOf(),
            flightGoals = flightGoals?.map {
                FlightGoal.valueOf(
                    it,
                )
            } ?: listOf(),
            actionType = actionType,
            actionDatetimeUtc = actionDatetimeUtc.atZone(ZoneOffset.UTC),
            emitsVms = emitsVms,
            emitsAis = emitsAis,
            logbookMatchesActivity = logbookMatchesActivity,
            licencesMatchActivity = licencesMatchActivity,
            speciesWeightControlled = speciesWeightControlled,
            speciesSizeControlled = speciesSizeControlled,
            separateStowageOfPreservedSpecies = separateStowageOfPreservedSpecies,
            logbookInfractions = deserializeJSONList(
                mapper,
                logbookInfractions,
                LogbookInfraction::class.java,
            ),
            licencesAndLogbookObservations = licencesAndLogbookObservations,
            gearInfractions = deserializeJSONList(
                mapper,
                gearInfractions,
                GearInfraction::class.java,
            ),
            speciesInfractions = deserializeJSONList(mapper, speciesInfractions, SpeciesInfraction::class.java),
            speciesObservations = speciesObservations,
            seizureAndDiversion = seizureAndDiversion,
            otherInfractions = deserializeJSONList(mapper, otherInfractions, OtherInfraction::class.java),
            numberOfVesselsFlownOver = numberOfVesselsFlownOver,
            unitWithoutOmegaGauge = unitWithoutOmegaGauge,
            controlQualityComments = controlQualityComments,
            feedbackSheetRequired = feedbackSheetRequired,
            userTrigram = userTrigram,
            segments = deserializeJSONList(
                mapper,
                segments,
                FleetSegment::class.java,
            ),
            facade = facade?.let { Seafront.from(it).toString() },
            longitude = longitude,
            latitude = latitude,
            portLocode = portLocode,
            vesselTargeted = vesselTargeted,
            seizureAndDiversionComments = seizureAndDiversionComments,
            otherComments = otherComments,
            gearOnboard = deserializeJSONList(
                mapper,
                gearOnboard,
                GearControl::class.java,
            ),
            speciesOnboard = deserializeJSONList(mapper, speciesOnboard, SpeciesControl::class.java),
            isDeleted = isDeleted,
            hasSomeGearsSeized = hasSomeGearsSeized,
            hasSomeSpeciesSeized = hasSomeSpeciesSeized,
            completedBy = completedBy,
            completion = completion,
            isFromPoseidon = isFromPoseidon,
            isAdministrativeControl = isAdministrativeControl,
            isComplianceWithWaterRegulationsControl = isComplianceWithWaterRegulationsControl,
            isSafetyEquipmentAndStandardsComplianceControl = isSafetyEquipmentAndStandardsComplianceControl,
            isSeafarersControl = isSeafarersControl,
        )

    private fun <T> deserializeJSONList(mapper: ObjectMapper, json: String?, clazz: Class<T>): List<T> = json?.let {
        mapper.readValue(
            json,
            mapper.typeFactory
                .constructCollectionType(MutableList::class.java, clazz),
        )
    } ?: listOf()

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MissionActionEntity

        return id == other.id
    }

    override fun hashCode(): Int {
        var result = id ?: 0
        result = 31 * result + missionId
        result = 31 * result + actionType.hashCode()
        result = 31 * result + actionDatetimeUtc.hashCode()
        return result
    }
}
