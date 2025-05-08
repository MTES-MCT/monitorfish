package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_profile.VesselProfile
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type

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
    fun toVesselProfile() =
        VesselProfile(
            cfr = cfr,
            gears = gears,
            species = species,
            faoAreas = faoAreas,
            segments = segments,
            landingPorts = landingPorts,
            recentGears = recentGears,
            recentSpecies = recentSpecies,
            recentFaoAreas = recentFaoAreas,
            recentSegments = recentSegments,
            recentLandingPorts = recentLandingPorts,
            latestLandingPort = latestLandingPort,
            latestLandingFacade = latestLandingFacade,
        )
}
