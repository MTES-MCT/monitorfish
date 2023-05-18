package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "user_authorizations")
data class UserAuthorizationEntity(
    @Id
    @Column(name = "hashed_email", nullable = false)
    val hashedEmail: String,
    @Column(name = "is_super_user", nullable = false)
    val isSuperUser: Boolean,
) {

    fun toUserAuthorization() = UserAuthorization(
        hashedEmail = hashedEmail,
        isSuperUser = isSuperUser,
    )
}
