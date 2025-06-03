package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface DBUserAuthorizationRepository : CrudRepository<UserAuthorizationEntity, String> {
    fun findByHashedEmail(hashedEmail: String): UserAuthorizationEntity

    @Modifying
    @Query(
        nativeQuery = true,
        value = """
        INSERT INTO user_authorizations (
            hashed_email,
            is_super_user,
            service,
            is_administrator
        ) VALUES (
            :#{#user.hashedEmail},
            :#{#user.isSuperUser},
            CAST(:#{#user.service} AS cnsp_service),
            :#{#user.isAdministrator}
        )
        ON CONFLICT(hashed_email)
        DO UPDATE SET
          is_super_user = EXCLUDED.is_super_user,
          service = EXCLUDED.service,
          is_administrator = EXCLUDED.is_administrator;
    """,
    )
    fun saveUserAuthorization(user: UserAuthorizationEntity)
}
