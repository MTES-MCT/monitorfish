package fr.gouv.cnsp.monitorfish.domain.entities.facade

import org.locationtech.jts.geom.Geometry

data class FacadeArea(
    val facade: String,
    val geometry: Geometry
)
