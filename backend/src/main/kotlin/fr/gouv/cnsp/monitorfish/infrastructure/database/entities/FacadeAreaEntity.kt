package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.facade.FacadeArea
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.locationtech.jts.geom.Geometry

@Entity
@Table(name = "facade_areas_subdivided")
data class FacadeAreaEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "facade", columnDefinition = "facade")
    val facade: String,
    @Column(name = "geometry", columnDefinition = "Geometry")
    val geometry: Geometry,
) {
    fun toFacadeArea() =
        FacadeArea(
            facade = Seafront.from(facade).toString(),
            geometry = geometry,
        )
}
