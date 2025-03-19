package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.GroupType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import jakarta.persistence.*
import java.time.ZonedDateTime

@Entity
@Table(name = "vessel_groups")
data class VesselGroupEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "is_deleted")
    val isDeleted: Boolean,
    @Column(name = "name")
    val name: String,
    @Column(name = "description")
    val description: String,
    @Column(name = "color")
    val color: String,
    @Column(name = "points_of_attention")
    val pointsOfAttention: String,
    @Column(name = "filters")
    val filters: String,
    @Column(name = "sharing")
    @Enumerated(EnumType.STRING)
    val sharing: Sharing,
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    val type: GroupType,
    @Column(name = "created_by")
    val createdBy: String,
    @Column(name = "created_at_utc")
    val createdAtUtc: ZonedDateTime,
    @Column(name = "updated_at_utc")
    val updatedAtUtc: ZonedDateTime? = null,
    @Column(name = "end_of_validity_utc")
    val endOfValidityUtc: ZonedDateTime? = null,
) {
    fun toVesselGroup(mapper: ObjectMapper) =
        VesselGroup(
            id = id,
            name = name,
            isDeleted = isDeleted,
            description = description,
            color = color,
            pointsOfAttention = pointsOfAttention,
            filters = mapper.readValue(filters, VesselGroupFilters::class.java),
            sharing = sharing,
            type = type,
            createdBy = createdBy,
            createdAtUtc = createdAtUtc,
            updatedAtUtc = updatedAtUtc,
            endOfValidityUtc = endOfValidityUtc,
        )

    companion object {
        fun fromVesselGroup(
            mapper: ObjectMapper,
            vesselGroup: VesselGroup,
        ) = VesselGroupEntity(
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
    }
}
