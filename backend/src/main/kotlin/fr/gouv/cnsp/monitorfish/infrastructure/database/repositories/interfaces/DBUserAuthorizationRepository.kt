package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.UserAuthorizationEntity
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime

interface DBUserAuthorizationRepository : CrudRepository<UserAuthorizationEntity, String> {
    fun findByHashedEmail(hashedEmail: String): UserAuthorizationEntity

    @Modifying
    @Query(
        nativeQuery = true,
        value = """
        INSERT INTO user_authorizations (
            hashed_email,
            email,
            is_super_user,
            service,
            is_administrator,
            administration
        ) VALUES (
            :#{#user.hashedEmail},
            :#{#user.email},
            :#{#user.isSuperUser},
            CAST(:#{#user.service} AS cnsp_service),
            :#{#user.isAdministrator},
            CAST(:#{#user.administration} AS external_administration)
        )
        ON CONFLICT(hashed_email)
        DO UPDATE SET
          email = COALESCE(EXCLUDED.email, user_authorizations.email),
          is_super_user = EXCLUDED.is_super_user,
          service = EXCLUDED.service,
          is_administrator = EXCLUDED.is_administrator,
          administration = EXCLUDED.administration;
    """,
    )
    fun upsertUserAuthorization(user: UserAuthorizationEntity)

    @Modifying
    @Query(
        nativeQuery = true,
        value = """
        UPDATE user_authorizations
        SET email = COALESCE(email, :email), last_login_at_utc = :loginDateUtc
        WHERE hashed_email = :hashedEmail
    """,
    )
    fun saveLogin(
        hashedEmail: String,
        email: String,
        loginDateUtc: ZonedDateTime,
    )
}
