package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.InfractionEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBInfractionRepository : CrudRepository<InfractionEntity, Long> {
    fun findByNatinfCodeEquals(natinfCode: Int): InfractionEntity

    @Query(
        value = """
        SELECT
            *
        FROM
            infractions
        WHERE
            infraction_category IN ('Sécurité / Rôle', 'Pêche')
        """,
        nativeQuery = true,
    )
    fun findAllByInfractionCategoryEqualsSecurityOrFishing(): List<InfractionEntity>
}
