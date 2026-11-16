package fr.gouv.cnsp.monitorfish.domain.repositories

interface RegulatoryCatalogueRepository {
    /**
     * The regulatory zones without their geometry, as the GeoJSON returned by the GeoServer layer
     * `monitorfish:regulations` for the same properties.
     */
    fun findAllAsGeoJson(): String
}
