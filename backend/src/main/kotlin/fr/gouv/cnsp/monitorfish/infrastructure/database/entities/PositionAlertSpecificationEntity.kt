package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.deserializeJSONList
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "position_alerts")
data class PositionAlertSpecificationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "name", nullable = false)
    val name: String,
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    val description: String,
    @Column(name = "is_user_defined", nullable = false)
    val isUserDefined: Boolean = true,
    @Column(name = "natinf_code", nullable = false)
    val natinfCode: Int,
    @Column(name = "is_activated", nullable = false)
    val isActivated: Boolean = true,
    @Column(name = "is_in_error", nullable = false)
    val isInError: Boolean = false,
    @Column(name = "has_automatic_archiving", nullable = false)
    val hasAutomaticArchiving: Boolean = false,
    @Column(name = "error_reason", columnDefinition = "TEXT")
    val errorReason: String? = null,
    @Column(name = "validity_start_datetime_utc")
    val validityStartDatetimeUtc: ZonedDateTime? = null,
    @Column(name = "validity_end_datetime_utc")
    val validityEndDatetimeUtc: ZonedDateTime? = null,
    @Column(name = "repeat_each_year", nullable = false)
    val repeatEachYear: Boolean = false,
    @Column(name = "track_analysis_depth", nullable = false)
    val trackAnalysisDepth: Double,
    @Column(name = "only_fishing_positions", nullable = false)
    val onlyFishingPositions: Boolean = true,
    @Type(JsonBinaryType::class)
    @Column(name = "gears", columnDefinition = "jsonb")
    val gears: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species", columnDefinition = "jsonb")
    val species: String? = null,
    @Column(name = "species_catch_areas", columnDefinition = "varchar[]")
    val speciesCatchAreas: List<String>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "administrative_areas", columnDefinition = "jsonb")
    val administrativeAreas: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "regulatory_areas", columnDefinition = "jsonb")
    val regulatoryAreas: String? = null,
    @Column(name = "min_depth")
    val minDepth: Double? = null,
    @Column(name = "flag_states_iso2", columnDefinition = "varchar[]")
    val flagStatesIso2: List<String>? = null,
    @Column(name = "vessel_ids", columnDefinition = "integer[]")
    val vesselIds: List<Int>? = null,
    @Column(name = "district_codes", columnDefinition = "varchar[]")
    val districtCodes: List<String>? = null,
    @Column(name = "producer_organizations", columnDefinition = "varchar[]")
    val producerOrganizations: List<String>? = null,
    @Column(name = "is_deleted")
    val isDeleted: Boolean,
    @Column(name = "created_by")
    val createdBy: String,
    @Column(name = "created_at_utc")
    val createdAtUtc: ZonedDateTime,
) {
    fun toPositionAlertSpecification(mapper: ObjectMapper): PositionAlertSpecification =
        PositionAlertSpecification(
            id = id,
            name = name,
            description = description,
            isUserDefined = isUserDefined,
            natinfCode = natinfCode,
            isActivated = isActivated,
            isInError = isInError,
            isDeleted = isDeleted,
            hasAutomaticArchiving = hasAutomaticArchiving,
            errorReason = errorReason,
            validityStartDatetimeUtc = validityStartDatetimeUtc,
            validityEndDatetimeUtc = validityEndDatetimeUtc,
            repeatEachYear = repeatEachYear,
            trackAnalysisDepth = trackAnalysisDepth,
            onlyFishingPositions = onlyFishingPositions,
            gears = deserializeJSONList(mapper, gears, GearSpecification::class.java),
            species = deserializeJSONList(mapper, species, SpeciesSpecification::class.java),
            speciesCatchAreas = speciesCatchAreas ?: listOf(),
            administrativeAreas =
                deserializeJSONList(
                    mapper,
                    administrativeAreas,
                    AdministrativeAreaSpecification::class.java,
                ),
            regulatoryAreas = deserializeJSONList(mapper, regulatoryAreas, RegulatoryAreaSpecification::class.java),
            minDepth = minDepth,
            flagStatesIso2 = flagStatesIso2 ?: listOf(),
            vesselIds = vesselIds ?: listOf(),
            districtCodes = districtCodes ?: listOf(),
            producerOrganizations = producerOrganizations ?: listOf(),
            createdBy = createdBy,
            createdAtUtc = createdAtUtc,
        )

    companion object {
        fun fromPositionAlertSpecification(
            alertSpecification: PositionAlertSpecification,
            mapper: ObjectMapper,
        ): PositionAlertSpecificationEntity {
            requireNotNull(alertSpecification.createdBy)
            requireNotNull(alertSpecification.createdAtUtc)

            return PositionAlertSpecificationEntity(
                id = alertSpecification.id,
                name = alertSpecification.name,
                description = alertSpecification.description,
                isUserDefined = alertSpecification.isUserDefined,
                natinfCode = alertSpecification.natinfCode,
                isActivated = alertSpecification.isActivated,
                isInError = alertSpecification.isInError,
                isDeleted = alertSpecification.isDeleted,
                hasAutomaticArchiving = alertSpecification.hasAutomaticArchiving,
                errorReason = alertSpecification.errorReason,
                validityStartDatetimeUtc = alertSpecification.validityStartDatetimeUtc,
                validityEndDatetimeUtc = alertSpecification.validityEndDatetimeUtc,
                repeatEachYear = alertSpecification.repeatEachYear,
                trackAnalysisDepth = alertSpecification.trackAnalysisDepth,
                onlyFishingPositions = alertSpecification.onlyFishingPositions,
                gears = mapper.writeValueAsString(alertSpecification.gears),
                species = mapper.writeValueAsString(alertSpecification.species),
                speciesCatchAreas = alertSpecification.speciesCatchAreas,
                administrativeAreas = mapper.writeValueAsString(alertSpecification.administrativeAreas),
                regulatoryAreas = mapper.writeValueAsString(alertSpecification.regulatoryAreas),
                minDepth = alertSpecification.minDepth,
                flagStatesIso2 = alertSpecification.flagStatesIso2,
                vesselIds = alertSpecification.vesselIds,
                districtCodes = alertSpecification.districtCodes,
                producerOrganizations = alertSpecification.producerOrganizations,
                createdBy = alertSpecification.createdBy,
                createdAtUtc = alertSpecification.createdAtUtc,
            )
        }
    }
}
