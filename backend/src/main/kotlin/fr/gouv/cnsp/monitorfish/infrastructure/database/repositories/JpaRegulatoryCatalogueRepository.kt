package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.repositories.RegulatoryCatalogueRepository
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Repository

@Repository
class JpaRegulatoryCatalogueRepository(
    private val entityManager: EntityManager,
) : RegulatoryCatalogueRepository {
    /**
     * GeoServer returns the `jsonb` columns as JSON strings: they are cast to `text` to keep the same format.
     */
    override fun findAllAsGeoJson(): String =
        entityManager
            .createNativeQuery(
                """
                SELECT json_build_object(
                    'type', 'FeatureCollection',
                    'features', COALESCE(
                        json_agg(
                            json_build_object(
                                'type', 'Feature',
                                'id', 'regulations.' || id,
                                'geometry', NULL,
                                'properties', json_build_object(
                                    'id', id,
                                    'law_type', law_type,
                                    'topic', topic,
                                    'gears', gears::text,
                                    'species', species::text,
                                    'regulatory_references', regulatory_references::text,
                                    'zone', zone,
                                    'region', region,
                                    'tags', tags::text
                                )
                            )
                            ORDER BY id
                        ),
                        '[]'::json
                    )
                )::text
                FROM public.regulations_view
                """.trimIndent(),
            ).singleResult as String
}
