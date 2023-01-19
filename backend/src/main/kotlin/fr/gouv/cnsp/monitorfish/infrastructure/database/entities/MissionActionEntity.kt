package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.*
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.time.Instant
import java.time.ZoneOffset
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@TypeDefs(
    TypeDef(
        name = "jsonb",
        typeClass = JsonBinaryType::class
    )
)
@Table(name = "mission_actions")
data class MissionActionEntity(
    @Id
    @Column(name = "id")
    var id: Int,
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
    @Type(type = "jsonb")
    @Column(name = "logbook_infractions", columnDefinition = "jsonb")
    var logbookInfractions: String? = null,
    @Column(name = "licences_and_logbook_observations")
    var licencesAndLogbookObservations: String,
    @Type(type = "jsonb")
    @Column(name = "gear_infractions", columnDefinition = "jsonb")
    var gearInfractions: String? = null,
    @Type(type = "jsonb")
    @Column(name = "species_infractions", columnDefinition = "jsonb")
    var speciesInfractions: String? = null,
    @Column(name = "species_observations")
    var speciesObservations: String? = null,
    @Column(name = "seizure_and_diversion")
    var seizureAndDiversion: Boolean? = null,
    @Type(type = "jsonb")
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
    @Type(type = "jsonb")
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
    @Column(name = "diversion")
    var diversion: Boolean? = null,
    @Column(name = "seizure_and_diversion_comments")
    var seizureAndDiversionComments: String? = null,
    @Column(name = "other_comments")
    var otherComments: String? = null,
    @Type(type = "jsonb")
    @Column(name = "gear_onboard", columnDefinition = "jsonb")
    var gearOnboard: String? = null,
    @Type(type = "jsonb")
    @Column(name = "species_onboard", columnDefinition = "jsonb")
    var speciesOnboard: String? = null
) {

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
        logbookInfractions = deserializeJSON(mapper, logbookInfractions, LogbookInfraction::class.java),
        licencesAndLogbookObservations = licencesAndLogbookObservations,
        gearInfractions = deserializeJSON(mapper, gearInfractions, GearInfraction::class.java),
        speciesInfractions = deserializeJSON(mapper, speciesInfractions, SpeciesInfraction::class.java),
        speciesObservations = speciesObservations,
        seizureAndDiversion = seizureAndDiversion,
        otherInfractions = deserializeJSON(mapper, otherInfractions, OtherInfraction::class.java),
        numberOfVesselsFlownOver = numberOfVesselsFlownOver,
        unitWithoutOmegaGauge = unitWithoutOmegaGauge,
        controlQualityComments = controlQualityComments,
        feedbackSheetRequired = feedbackSheetRequired,
        userTrigram = userTrigram,
        segments = segments,
        facade = facade,
        longitude = longitude,
        latitude = latitude,
        portLocode = portLocode,
        vesselTargeted = vesselTargeted,
        diversion = diversion,
        seizureAndDiversionComments = seizureAndDiversionComments,
        otherComments = otherComments,
        gearOnboard = deserializeJSON(mapper, gearOnboard, GearControl::class.java),
        speciesOnboard = deserializeJSON(mapper, speciesOnboard, SpeciesControl::class.java)
    )

    private fun <T> deserializeJSON(mapper: ObjectMapper, json: String?, clazz: Class<T>): List<T> = json?.let {
        mapper.readValue(
            json,
            mapper.typeFactory
                .constructCollectionType(MutableList::class.java, clazz)
        )
    } ?: listOf()
}
