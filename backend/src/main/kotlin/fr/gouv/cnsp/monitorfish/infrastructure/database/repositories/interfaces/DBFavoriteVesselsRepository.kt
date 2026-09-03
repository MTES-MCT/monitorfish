package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.FavoriteVesselsEntity
import org.springframework.data.repository.CrudRepository

interface DBFavoriteVesselsRepository : CrudRepository<FavoriteVesselsEntity, String> {
    fun findAllByHashedEmailEquals(hashedEmail: String): FavoriteVesselsEntity?
}
