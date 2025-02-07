package fr.gouv.cnsp.monitorfish.domain.entities.coordinates

import org.locationtech.proj4j.*

const val WSG84_PROJECTION = "EPSG:4326"
const val OPENLAYERS_PROJECTION = "EPSG:3857"

val crsFactory = CRSFactory()
val WSG84_PROJECTION_CRS: CoordinateReferenceSystem = crsFactory.createFromName(WSG84_PROJECTION)
val OPENLAYERS_PROJECTION_CRS: CoordinateReferenceSystem = crsFactory.createFromName(OPENLAYERS_PROJECTION)

val transformFactory = CoordinateTransformFactory()
val transformFromWSG84ToOpenLayers: CoordinateTransform =
    transformFactory.createTransform(
        WSG84_PROJECTION_CRS,
        OPENLAYERS_PROJECTION_CRS,
    )

fun transformCoordinates(
    longitude: Double,
    latitude: Double,
): Pair<Double, Double> {
    val sourceCoordinates = ProjCoordinate(longitude, latitude)
    val targetCoordinates = ProjCoordinate()

    transformFromWSG84ToOpenLayers.transform(sourceCoordinates, targetCoordinates)

    return targetCoordinates.x to targetCoordinates.y
}
