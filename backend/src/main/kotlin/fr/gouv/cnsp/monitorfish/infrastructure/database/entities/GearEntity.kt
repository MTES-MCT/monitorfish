package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.Gear
import javax.persistence.*

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
