package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.deserializeJSONList
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "vessel_profiles")
data class VesselProfileEntity(
    @Id
    @Column(name = "cfr")
    val cfr: String,
    @Type(JsonBinaryType::class)
    @Column(name = "gears", columnDefinition = "jsonb")
    val gears: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "species", columnDefinition = "jsonb")
    val species: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "fao_areas", columnDefinition = "jsonb")
    val faoAreas: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "segments", columnDefinition = "jsonb")
    val segments: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "landing_ports", columnDefinition = "jsonb")
    val landingPorts: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "recent_gears", columnDefinition = "jsonb")
    val recentGears: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "recent_species", columnDefinition = "jsonb")
    val recentSpecies: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "recent_fao_areas", columnDefinition = "jsonb")
    val recentFaoAreas: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "recent_segments", columnDefinition = "jsonb")
    val recentSegments: Map<String, Double>? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "recent_landing_ports", columnDefinition = "jsonb")
    val recentLandingPorts: Map<String, Double>? = null,
    @Column(name = "latest_landing_port")
    val latestLandingPort: String,
    @Column(name = "latest_landing_facade")
    val latestLandingFacade: String,
    ) {
    fun toVesselGroup(mapper: ObjectMapper): VesselGroupBase =
        when (type) {
            GroupType.DYNAMIC ->
                DynamicVesselGroup(
                    id = id,
                    name = name,
                    isDeleted = isDeleted,
                    description = description,
                    color = color,
                    pointsOfAttention = pointsOfAttention,
                    filters = mapper.readValue(filters, VesselGroupFilters::class.java),
                    sharing = sharing,
                    createdBy = createdBy,
                    createdAtUtc = createdAtUtc,
                    updatedAtUtc = updatedAtUtc,
                    endOfValidityUtc = endOfValidityUtc,
                )
            GroupType.FIXED ->
                FixedVesselGroup(
                    id = id,
                    name = name,
                    isDeleted = isDeleted,
                    description = description,
                    color = color,
                    pointsOfAttention = pointsOfAttention,
                    vessels = deserializeJSONList(mapper, vessels, VesselIdentity::class.java),
                    sharing = sharing,
                    createdBy = createdBy,
                    createdAtUtc = createdAtUtc,
                    updatedAtUtc = updatedAtUtc,
                    endOfValidityUtc = endOfValidityUtc,
                )
        }

    companion object {
        fun fromDynamicVesselGroup(
            mapper: ObjectMapper,
            vesselGroup: DynamicVesselGroup,
        ) = VesselProfileEntity(
            id = vesselGroup.id,
            name = vesselGroup.name,
            isDeleted = vesselGroup.isDeleted,
            description = vesselGroup.description,
            color = vesselGroup.color,
            pointsOfAttention = vesselGroup.pointsOfAttention,
            filters = mapper.writeValueAsString(vesselGroup.filters),
            sharing = vesselGroup.sharing,
            type = vesselGroup.type,
            createdBy = vesselGroup.createdBy,
            createdAtUtc = vesselGroup.createdAtUtc,
            updatedAtUtc = vesselGroup.updatedAtUtc,
            endOfValidityUtc = vesselGroup.endOfValidityUtc,
        )

        fun fromFixedVesselGroup(
            mapper: ObjectMapper,
            vesselGroup: FixedVesselGroup,
        ) = VesselProfileEntity(
            id = vesselGroup.id,
            name = vesselGroup.name,
            isDeleted = vesselGroup.isDeleted,
            description = vesselGroup.description,
            color = vesselGroup.color,
            pointsOfAttention = vesselGroup.pointsOfAttention,
            vessels = mapper.writeValueAsString(vesselGroup.vessels),
            sharing = vesselGroup.sharing,
            type = vesselGroup.type,
            createdBy = vesselGroup.createdBy,
            createdAtUtc = vesselGroup.createdAtUtc,
            updatedAtUtc = vesselGroup.updatedAtUtc,
            endOfValidityUtc = vesselGroup.endOfValidityUtc,
        )
    }
}
