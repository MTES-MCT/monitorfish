package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.AuthorizedUser
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAuthorizedUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    private val logger = LoggerFactory.getLogger(GetAuthorizedUser::class.java)

    fun execute(email: String): AuthorizedUser {
        val hashedEmail = hash(email)

        return try {
            val userAuthorization = userAuthorizationRepository.findByHashedEmail(hashedEmail)

            AuthorizedUser.fromUserAuthorization(userAuthorization = userAuthorization, email = email)
        } catch (e: Throwable) {
            logger.info("User $email not found, defaulting to super-user=false")

            // By default, a user not found is not super-user
            AuthorizedUser(
                email = email,
                isSuperUser = false,
                service = null,
            )
        }
    }
}
