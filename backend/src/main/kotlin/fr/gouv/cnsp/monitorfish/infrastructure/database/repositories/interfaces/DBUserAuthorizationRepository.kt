package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import org.springframework.data.repository.CrudRepository

interface DBUserAuthorizationRepository : CrudRepository<UserAuthorizationEntity, String> {
    fun findByHashedEmail(hashedEmail: String): UserAuthorizationEntity
}
