package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.*
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.deserializeJSONList
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.ZonedDateTime

@Entity
@Table(name = "vessel_groups")
data class VesselGroupEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    val id: Int?,
    @Column(name = "is_deleted")
    val isDeleted: Boolean,
    @Column(name = "name")
    val name: String,
    @Column(name = "description")
    val description: String? = null,
    @Column(name = "color")
    val color: String,
    @Column(name = "points_of_attention")
    val pointsOfAttention: String?,
    @Type(JsonBinaryType::class)
    @Column(name = "filters", columnDefinition = "jsonb")
    val filters: String? = null,
    @Type(JsonBinaryType::class)
    @Column(name = "vessels", columnDefinition = "jsonb")
    val vessels: String? = null,
    @Column(name = "sharing")
    @Enumerated(EnumType.STRING)
    val sharing: Sharing,
    @Column(name = "shared_to", columnDefinition = "cnsp_service[]")
    val sharedTo: List<String>? = listOf(),
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
    @Column(name = "start_of_validity_utc")
    val startOfValidityUtc: ZonedDateTime? = null,
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
                    sharedTo = sharedTo?.map { CnspService.fromValue(it) } ?: listOf(),
                    createdBy = createdBy,
                    createdAtUtc = createdAtUtc,
                    updatedAtUtc = updatedAtUtc,
                    endOfValidityUtc = endOfValidityUtc,
                    startOfValidityUtc = startOfValidityUtc,
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
                    sharedTo = sharedTo?.map { CnspService.fromValue(it) } ?: listOf(),
                    createdBy = createdBy,
                    createdAtUtc = createdAtUtc,
                    updatedAtUtc = updatedAtUtc,
                    endOfValidityUtc = endOfValidityUtc,
                    startOfValidityUtc = startOfValidityUtc,
                )
        }

    companion object {
        fun fromDynamicVesselGroup(
            mapper: ObjectMapper,
            vesselGroup: DynamicVesselGroup,
        ) = VesselGroupEntity(
            id = vesselGroup.id,
            name = vesselGroup.name,
            isDeleted = vesselGroup.isDeleted,
            description = vesselGroup.description,
            color = vesselGroup.color,
            pointsOfAttention = vesselGroup.pointsOfAttention,
            filters = mapper.writeValueAsString(vesselGroup.filters),
            sharing = vesselGroup.sharing,
            sharedTo = vesselGroup.sharedTo?.map { it.value },
            type = vesselGroup.type,
            createdBy = vesselGroup.createdBy,
            createdAtUtc = vesselGroup.createdAtUtc,
            updatedAtUtc = vesselGroup.updatedAtUtc,
            endOfValidityUtc = vesselGroup.endOfValidityUtc,
            startOfValidityUtc = vesselGroup.startOfValidityUtc,
        )

        fun fromFixedVesselGroup(
            mapper: ObjectMapper,
            vesselGroup: FixedVesselGroup,
        ) = VesselGroupEntity(
            id = vesselGroup.id,
            name = vesselGroup.name,
            isDeleted = vesselGroup.isDeleted,
            description = vesselGroup.description,
            color = vesselGroup.color,
            pointsOfAttention = vesselGroup.pointsOfAttention,
            vessels = mapper.writeValueAsString(vesselGroup.vessels),
            sharing = vesselGroup.sharing,
            sharedTo = vesselGroup.sharedTo?.map { it.value },
            type = vesselGroup.type,
            createdBy = vesselGroup.createdBy,
            createdAtUtc = vesselGroup.createdAtUtc,
            updatedAtUtc = vesselGroup.updatedAtUtc,
            endOfValidityUtc = vesselGroup.endOfValidityUtc,
            startOfValidityUtc = vesselGroup.startOfValidityUtc,
        )
    }
}
