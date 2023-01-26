package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "fao_areas")
data class FAOAreasEntity(
    @Id
    @Column(name = "f_code")
    val faoCode: String,
    @Column(name = "f_subarea")
    val subArea: String? = null,
    @Column(name = "f_division")
    val division: String? = null
) {

    fun toFAOArea() = FAOArea(
        faoCode = faoCode,
        subArea = subArea,
        division = division
    )
}
