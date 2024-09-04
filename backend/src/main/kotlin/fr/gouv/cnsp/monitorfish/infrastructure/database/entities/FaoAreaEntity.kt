package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FaoArea
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "fao_areas")
data class FaoAreaEntity(
    @Id
    @Column(name = "f_code")
    val faoCode: String,
) {
    fun toFaoArea() =
        FaoArea(
            faoCode = faoCode,
        )
}
