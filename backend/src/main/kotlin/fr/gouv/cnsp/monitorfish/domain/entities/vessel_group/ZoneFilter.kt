package fr.gouv.cnsp.monitorfish.domain.entities.vessel_group

import org.locationtech.jts.geom.Geometry

data class ZoneFilter(
    val feature: Geometry,
    val label: String,
    val value: String,
)
