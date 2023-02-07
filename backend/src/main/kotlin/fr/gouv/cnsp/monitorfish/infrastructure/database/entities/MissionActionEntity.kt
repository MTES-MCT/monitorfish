package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.Instant
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Entity
@Table(name = "mission_actions")
class MissionActionEntity(
    @Id
    @SequenceGenerator(name = "mission_actions_id_seq", sequenceName = "mission_actions_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mission_actions_id_seq")
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    var id: Int? = null,
    @Column(name = "vessel_id")
    var vesselId: Int,
    @Column(name = "mission_id")
    var missionId: Int,
    @Column(name = "action_type")
    @Enumerated(EnumType.STRING)
    var actionType: MissionActionType,
    @Column(name = "action_datetime_utc")
    var actionDatetimeUtc: Instant,
    @Column(name = "emits_vms")
    @Enumerated(EnumType.STRING)
    var emitsVms: ControlCheck? = null,
    @Column(name = "emits_ais")
    @Enumerated(EnumType.STRING)
    var emitsAis: ControlCheck? = null,
    @Column(name = "logbook_matches_activity")
    @Enumerated(EnumType.STRING)
    var logbookMatchesActivity: ControlCheck? = null,
    @Column(name = "licences_match_activity")
    @Enumerated(EnumType.STRING)
    var licencesMatchActivity: ControlCheck? = null,
    @Column(name = "species_weight_controlled")
    var speciesWeightControlled: Boolean? = null,
    @Column(name = "species_size_controlled")
    var speciesSizeControlled: Boolean? = null,
    @Column(name = "separate_stowage_of_preserved_species")
    var separateStowageOfPreservedSpecies: Boolean? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "logbook_infractions", columnDefinition = "jsonb")
    var logbookInfractions: String? = null,
    @Column(name = "licences_and_logbook_observations")
    var licencesAndLogbookObservations: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_infractions", columnDefinition = "jsonb")
    var gearInfractions: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species_infractions", columnDefinition = "jsonb")
    var speciesInfractions: String? = null,
    @Column(name = "species_observations")
    var speciesObservations: String? = null,
    @Column(name = "seizure_and_diversion")
    var seizureAndDiversion: Boolean? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "other_infractions", columnDefinition = "jsonb")
    var otherInfractions: String? = null,
    @Column(name = "number_of_vessels_flown_over")
    var numberOfVesselsFlownOver: Int? = null,
    @Column(name = "unit_without_omega_gauge")
    var unitWithoutOmegaGauge: Boolean? = null,
    @Column(name = "control_quality_comments")
    var controlQualityComments: String? = null,
    @Column(name = "feedback_sheet_required")
    var feedbackSheetRequired: Boolean? = null,
    @Column(name = "is_from_poseidon")
    var isFromPoseidon: Boolean,
    @Column(name = "user_trigram")
    var userTrigram: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "segments", columnDefinition = "jsonb")
    var segments: String? = null,
    @Column(name = "facade")
    var facade: String? = null,
    @Column(name = "longitude")
    var longitude: Double? = null,
    @Column(name = "latitude")
    var latitude: Double? = null,
    @Column(name = "port_locode")
    var portLocode: String? = null,
    @Column(name = "vessel_targeted")
    var vesselTargeted: Boolean? = null,
    @Column(name = "seizure_and_diversion_comments")
    var seizureAndDiversionComments: String? = null,
    @Column(name = "other_comments")
    var otherComments: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "gear_onboard", columnDefinition = "jsonb")
    var gearOnboard: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species_onboard", columnDefinition = "jsonb")
    var speciesOnboard: String? = null,
) {
    companion object {
        fun fromMissionAction(mapper: ObjectMapper, missionAction: MissionAction) = MissionActionEntity(
            vesselId = missionAction.vesselId,
            missionId = missionAction.missionId,
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
            facade = missionAction.facade,
            longitude = missionAction.longitude,
            latitude = missionAction.latitude,
            portLocode = missionAction.portLocode,
            vesselTargeted = missionAction.vesselTargeted,
            seizureAndDiversionComments = missionAction.seizureAndDiversionComments,
            otherComments = missionAction.otherComments,
            gearOnboard = mapper.writeValueAsString(missionAction.gearOnboard),
            speciesOnboard = mapper.writeValueAsString(missionAction.speciesOnboard),
            isFromPoseidon = false,
        )
    }

    fun toMissionAction(mapper: ObjectMapper) = MissionAction(
        id = id,
        vesselId = vesselId,
        missionId = missionId,
        actionType = actionType,
        actionDatetimeUtc = ZonedDateTime.from(actionDatetimeUtc.atOffset(ZoneOffset.UTC)),
        emitsVms = emitsVms,
        emitsAis = emitsAis,
        logbookMatchesActivity = logbookMatchesActivity,
        licencesMatchActivity = licencesMatchActivity,
        speciesWeightControlled = speciesWeightControlled,
        speciesSizeControlled = speciesSizeControlled,
        separateStowageOfPreservedSpecies = separateStowageOfPreservedSpecies,
        logbookInfractions = deserializeJSONList(mapper, logbookInfractions, LogbookInfraction::class.java),
        licencesAndLogbookObservations = licencesAndLogbookObservations,
        gearInfractions = deserializeJSONList(mapper, gearInfractions, GearInfraction::class.java),
        speciesInfractions = deserializeJSONList(mapper, speciesInfractions, SpeciesInfraction::class.java),
        speciesObservations = speciesObservations,
        seizureAndDiversion = seizureAndDiversion,
        otherInfractions = deserializeJSONList(mapper, otherInfractions, OtherInfraction::class.java),
        numberOfVesselsFlownOver = numberOfVesselsFlownOver,
        unitWithoutOmegaGauge = unitWithoutOmegaGauge,
        controlQualityComments = controlQualityComments,
        feedbackSheetRequired = feedbackSheetRequired,
        userTrigram = userTrigram,
        segments = deserializeJSONList(mapper, segments, FleetSegment::class.java),
        facade = facade,
        longitude = longitude,
        latitude = latitude,
        portLocode = portLocode,
        vesselTargeted = vesselTargeted,
        seizureAndDiversionComments = seizureAndDiversionComments,
        otherComments = otherComments,
        gearOnboard = deserializeJSONList(mapper, gearOnboard, GearControl::class.java),
        speciesOnboard = deserializeJSONList(mapper, speciesOnboard, SpeciesControl::class.java),
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

        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id ?: 0
        result = 31 * result + vesselId
        result = 31 * result + missionId
        result = 31 * result + actionType.hashCode()
        result = 31 * result + actionDatetimeUtc.hashCode()
        return result
    }
}
