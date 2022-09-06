package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "fishing_gear_codes")
data class GearEntity(
    @Id
    @Column(name = "fishing_gear_code")
    val code: String,
    @Column(name = "fishing_gear")
    val name: String,
    @Column(name = "fishing_gear_category")
    val category: String? = null) {

    fun toGear() = Gear(
        code = code,
        name = name,
        category = category,
    )
}
