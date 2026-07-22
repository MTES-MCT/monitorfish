package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardedSpeciesControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FlightGoal
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.GearControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionReporting
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.SpeciesOnboardControl
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WeightControlMethod
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CountryCodeConverter
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Basic
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.SequenceGenerator
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcType
import org.hibernate.annotations.Type
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType
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
    @Convert(converter = CountryCodeConverter::class)
    val flagState: CountryCode,
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
    @Column(name = "action_end_datetime_utc")
    val actionEndDatetimeUtc: Instant? = null,
    @Column(name = "emits_vms")
    @Enumerated(EnumType.STRING)
    val emitsVms: ControlCheck? = null,
    @Column(name = "emits_ais")
    @Enumerated(EnumType.STRING)
    val emitsAis: ControlCheck? = null,
    @Column(name = "vms_emission_control_before_arrival")
    @Enumerated(EnumType.STRING)
    val vmsEmissionControlBeforeArrival: ControlCheck? = null,
    @Column(name = "port_entrance_and_landing_authorized")
    @Enumerated(EnumType.STRING)
    val portEntranceAndLandingAuthorized: ControlCheck? = null,
    @Column(name = "logbook_opened_prior_to_control")
    @Enumerated(EnumType.STRING)
    val logbookOpenedPriorToControl: ControlCheck? = null,
    @Column(name = "logbook_matches_activity")
    @Enumerated(EnumType.STRING)
    val logbookMatchesActivity: ControlCheck? = null,
    @Column(name = "licences_match_activity")
    @Enumerated(EnumType.STRING)
    val licencesMatchActivity: ControlCheck? = null,
    @Column(name = "species_weight_controlled")
    @Enumerated(EnumType.STRING)
    val speciesWeightControlled: ControlCheck? = null,
    @Column(name = "species_size_controlled")
    @Enumerated(EnumType.STRING)
    val speciesSizeControlled: ControlCheck? = null,
    @Column(name = "separate_stowage_of_preserved_species")
    @Enumerated(EnumType.STRING)
    val separateStowageOfPreservedSpecies: ControlCheck? = null,
    @Column(name = "propulsion_engine_power_control")
    @Enumerated(EnumType.STRING)
    val propulsionEnginePowerControl: ControlCheck? = null,
    @Column(name = "gangway_present_and_compliant")
    @Enumerated(EnumType.STRING)
    val gangwayPresentAndCompliant: ControlCheck? = null,
    @Column(name = "european_fishing_licence_valid")
    @Enumerated(EnumType.STRING)
    val europeanFishingLicenceValid: ControlCheck? = null,
    @Column(name = "stowage_plan_present")
    @Enumerated(EnumType.STRING)
    val stowagePlanPresent: ControlCheck? = null,
    @Column(name = "onboard_weighing_permit")
    @Enumerated(EnumType.STRING)
    val onboardWeighingPermit: ControlCheck? = null,
    @Column(name = "weighing_certificate_and_systems_valid")
    @Enumerated(EnumType.STRING)
    val weighingCertificateAndSystemsValid: ControlCheck? = null,
    @Column(name = "under_sized_separate_stowage")
    @Enumerated(EnumType.STRING)
    val underSizedSeparateStowage: ControlCheck? = null,
    @Column(name = "under_sized_separate_recording")
    @Enumerated(EnumType.STRING)
    val underSizedSeparateRecording: ControlCheck? = null,
    @Column(name = "weight_control_method")
    @Enumerated(EnumType.STRING)
    val weightControlMethod: WeightControlMethod? = null,
    @Column(name = "approved_weighing_operator_information")
    @Enumerated(EnumType.STRING)
    val approvedWeighingOperatorInformation: ControlCheck? = null,
    @Column(name = "hold_controlled_after_unloading")
    @Enumerated(EnumType.STRING)
    val holdControlledAfterUnloading: ControlCheck? = null,
    @Column(name = "weighing_operations_monitored_by_inspectors")
    @Enumerated(EnumType.STRING)
    val weighingOperationsMonitoredByInspectors: ControlCheck? = null,
    @Column(name = "licences_and_logbook_observations")
    val licencesAndLogbookObservations: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "infractions", columnDefinition = "jsonb")
    val infractions: String? = null,
    @Column(name = "species_observations")
    val speciesObservations: String? = null,
    @Column(name = "seizure_and_diversion")
    val seizureAndDiversion: Boolean? = null,
    @Column(name = "number_of_vessels_flown_over")
    val numberOfVesselsFlownOver: Int? = null,
    @Column(name = "unit_without_omega_gauge")
    val unitWithoutOmegaGauge: Boolean? = null,
    @Column(name = "control_quality_comments")
    val controlQualityComments: String? = null,
    @Column(name = "is_from_poseidon")
    val isFromPoseidon: Boolean,
    @Column(name = "user_trigram")
    val userTrigram: String,
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
    @Column(name = "is_prioritized")
    val isPrioritized: Boolean = false,
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
    @Type(JsonBinaryType::class)
    @Column(name = "discarded_species", columnDefinition = "jsonb")
    val discardedSpecies: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "vessel_groups", columnDefinition = "jsonb")
    val vesselGroups: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "trip_reportings", columnDefinition = "jsonb")
    val tripReportings: String? = null,
    @Column(name = "is_deleted")
    val isDeleted: Boolean,
    @Column(name = "has_some_gears_seized")
    val hasSomeGearsSeized: Boolean,
    @Column(name = "has_some_species_seized")
    val hasSomeSpeciesSeized: Boolean,
    @Column(name = "is_last_haul")
    val isLastHaul: Boolean? = null,
    @Column(name = "species_quantity_seized")
    val speciesQuantitySeized: Int? = null,
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
    @Column(name = "is_inn_control")
    val isInnControl: Boolean,
    @Column(name = "is_unit_boarded")
    val isUnitBoarded: Boolean? = null,
    @Column(name = "observations_by_unit")
    val observationsByUnit: String? = null,
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
                actionEndDatetimeUtc = missionAction.actionEndDatetimeUtc?.let { it.toInstant() },
                emitsVms = missionAction.emitsVms,
                emitsAis = missionAction.emitsAis,
                vmsEmissionControlBeforeArrival = missionAction.vmsEmissionControlBeforeArrival,
                portEntranceAndLandingAuthorized = missionAction.portEntranceAndLandingAuthorized,
                logbookOpenedPriorToControl = missionAction.logbookOpenedPriorToControl,
                logbookMatchesActivity = missionAction.logbookMatchesActivity,
                licencesMatchActivity = missionAction.licencesMatchActivity,
                speciesWeightControlled = missionAction.speciesWeightControlled,
                speciesSizeControlled = missionAction.speciesSizeControlled,
                separateStowageOfPreservedSpecies = missionAction.separateStowageOfPreservedSpecies,
                propulsionEnginePowerControl = missionAction.propulsionEnginePowerControl,
                gangwayPresentAndCompliant = missionAction.gangwayPresentAndCompliant,
                europeanFishingLicenceValid = missionAction.europeanFishingLicenceValid,
                stowagePlanPresent = missionAction.stowagePlanPresent,
                onboardWeighingPermit = missionAction.onboardWeighingPermit,
                weighingCertificateAndSystemsValid = missionAction.weighingCertificateAndSystemsValid,
                underSizedSeparateStowage = missionAction.underSizedSeparateStowage,
                underSizedSeparateRecording = missionAction.underSizedSeparateRecording,
                weightControlMethod = missionAction.weightControlMethod,
                approvedWeighingOperatorInformation = missionAction.approvedWeighingOperatorInformation,
                holdControlledAfterUnloading = missionAction.holdControlledAfterUnloading,
                weighingOperationsMonitoredByInspectors = missionAction.weighingOperationsMonitoredByInspectors,
                infractions = mapper.writeValueAsString(missionAction.infractions),
                licencesAndLogbookObservations = missionAction.licencesAndLogbookObservations,
                speciesObservations = missionAction.speciesObservations,
                seizureAndDiversion = missionAction.seizureAndDiversion,
                numberOfVesselsFlownOver = missionAction.numberOfVesselsFlownOver,
                unitWithoutOmegaGauge = missionAction.unitWithoutOmegaGauge,
                controlQualityComments = missionAction.controlQualityComments,
                userTrigram = missionAction.userTrigram,
                segments = mapper.writeValueAsString(missionAction.segments),
                facade = missionAction.facade?.let { Seafront.from(it).toString() },
                longitude = missionAction.longitude,
                latitude = missionAction.latitude,
                portLocode = missionAction.portLocode,
                isPrioritized = missionAction.isPrioritized,
                seizureAndDiversionComments = missionAction.seizureAndDiversionComments,
                otherComments = missionAction.otherComments,
                gearOnboard = mapper.writeValueAsString(missionAction.gearOnboard),
                speciesOnboard = mapper.writeValueAsString(missionAction.speciesOnboard),
                discardedSpecies = mapper.writeValueAsString(missionAction.discardedSpecies),
                vesselGroups = mapper.writeValueAsString(missionAction.vesselGroups),
                tripReportings = mapper.writeValueAsString(missionAction.tripReportings),
                isFromPoseidon = missionAction.isFromPoseidon,
                isDeleted = missionAction.isDeleted,
                isLastHaul = missionAction.isLastHaul,
                hasSomeGearsSeized = missionAction.hasSomeGearsSeized,
                hasSomeSpeciesSeized = missionAction.hasSomeSpeciesSeized,
                speciesQuantitySeized = missionAction.speciesQuantitySeized,
                completedBy = missionAction.completedBy,
                completion = missionAction.completion,
                isAdministrativeControl = missionAction.isAdministrativeControl,
                isComplianceWithWaterRegulationsControl = missionAction.isComplianceWithWaterRegulationsControl,
                isSafetyEquipmentAndStandardsComplianceControl =
                    missionAction.isSafetyEquipmentAndStandardsComplianceControl,
                isSeafarersControl = missionAction.isSeafarersControl,
                isInnControl = missionAction.isINNControl,
                isUnitBoarded = missionAction.isUnitBoarded,
                observationsByUnit = missionAction.observationsByUnit,
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
            flightGoals =
                flightGoals?.map {
                    FlightGoal.valueOf(
                        it,
                    )
                } ?: listOf(),
            actionType = actionType,
            actionDatetimeUtc = actionDatetimeUtc.atZone(ZoneOffset.UTC),
            actionEndDatetimeUtc = actionEndDatetimeUtc?.atZone(ZoneOffset.UTC),
            emitsVms = emitsVms,
            emitsAis = emitsAis,
            vmsEmissionControlBeforeArrival = vmsEmissionControlBeforeArrival,
            portEntranceAndLandingAuthorized = portEntranceAndLandingAuthorized,
            logbookOpenedPriorToControl = logbookOpenedPriorToControl,
            logbookMatchesActivity = logbookMatchesActivity,
            licencesMatchActivity = licencesMatchActivity,
            speciesWeightControlled = speciesWeightControlled,
            speciesSizeControlled = speciesSizeControlled,
            separateStowageOfPreservedSpecies = separateStowageOfPreservedSpecies,
            propulsionEnginePowerControl = propulsionEnginePowerControl,
            gangwayPresentAndCompliant = gangwayPresentAndCompliant,
            europeanFishingLicenceValid = europeanFishingLicenceValid,
            stowagePlanPresent = stowagePlanPresent,
            onboardWeighingPermit = onboardWeighingPermit,
            weighingCertificateAndSystemsValid = weighingCertificateAndSystemsValid,
            underSizedSeparateStowage = underSizedSeparateStowage,
            underSizedSeparateRecording = underSizedSeparateRecording,
            weightControlMethod = weightControlMethod,
            approvedWeighingOperatorInformation = approvedWeighingOperatorInformation,
            holdControlledAfterUnloading = holdControlledAfterUnloading,
            weighingOperationsMonitoredByInspectors = weighingOperationsMonitoredByInspectors,
            licencesAndLogbookObservations = licencesAndLogbookObservations,
            infractions = deserializeJSONList(mapper, infractions, Infraction::class.java),
            speciesObservations = speciesObservations,
            seizureAndDiversion = seizureAndDiversion,
            numberOfVesselsFlownOver = numberOfVesselsFlownOver,
            unitWithoutOmegaGauge = unitWithoutOmegaGauge,
            controlQualityComments = controlQualityComments,
            userTrigram = userTrigram,
            segments =
                deserializeJSONList(
                    mapper,
                    segments,
                    FleetSegment::class.java,
                ),
            facade = facade?.let { Seafront.from(it).toString() },
            longitude = longitude,
            latitude = latitude,
            portLocode = portLocode,
            isPrioritized = isPrioritized,
            seizureAndDiversionComments = seizureAndDiversionComments,
            otherComments = otherComments,
            gearOnboard =
                deserializeJSONList(
                    mapper,
                    gearOnboard,
                    GearControl::class.java,
                ),
            speciesOnboard = deserializeJSONList(mapper, speciesOnboard, SpeciesOnboardControl::class.java),
            discardedSpecies = deserializeJSONList(mapper, discardedSpecies, DiscardedSpeciesControl::class.java),
            vesselGroups = deserializeJSONList(mapper, vesselGroups, MissionActionVesselGroup::class.java),
            tripReportings = deserializeJSONList(mapper, tripReportings, MissionActionReporting::class.java),
            isDeleted = isDeleted,
            isLastHaul = isLastHaul ?: false,
            hasSomeGearsSeized = hasSomeGearsSeized,
            hasSomeSpeciesSeized = hasSomeSpeciesSeized,
            speciesQuantitySeized = speciesQuantitySeized,
            completedBy = completedBy,
            completion = completion,
            isFromPoseidon = isFromPoseidon,
            isAdministrativeControl = isAdministrativeControl,
            isComplianceWithWaterRegulationsControl = isComplianceWithWaterRegulationsControl,
            isSafetyEquipmentAndStandardsComplianceControl = isSafetyEquipmentAndStandardsComplianceControl,
            isSeafarersControl = isSeafarersControl,
            isINNControl = isInnControl,
            isUnitBoarded = isUnitBoarded,
            observationsByUnit = observationsByUnit,
        )

    private fun <T> deserializeJSONList(
        mapper: ObjectMapper,
        json: String?,
        clazz: Class<T>,
    ): List<T> =
        json?.let {
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
