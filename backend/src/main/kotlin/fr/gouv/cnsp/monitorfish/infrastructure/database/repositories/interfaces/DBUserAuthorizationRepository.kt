package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.BeaconEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param

interface DBUserAuthorizationRepository : CrudRepository<UserAuthorizationEntity, String> {
    fun findByHashedEmail(hashedEmail: String): UserAuthorizationEntity
}
