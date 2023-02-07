package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.gear.GearCodeGroup
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "fishing_gear_codes_groups")
data class GearCodeGroupEntity(
    @Id
    @Column(name = "fishing_gear_code")
    val code: String,
    @Column(name = "fishing_gear_group_id")
    val groupId: Int,
) {

    fun toGearCodeGroup() = GearCodeGroup(
        code = code,
        groupId = groupId,
    )
}
