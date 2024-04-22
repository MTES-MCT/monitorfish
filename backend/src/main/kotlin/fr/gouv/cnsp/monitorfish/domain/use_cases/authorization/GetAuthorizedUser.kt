package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.slf4j.LoggerFactory

@UseCase
class GetAuthorizedUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    private val logger = LoggerFactory.getLogger(GetAuthorizedUser::class.java)

    fun execute(email: String): UserAuthorization {
        val hashedEmail = hash(email)

        return try {
            userAuthorizationRepository.findByHashedEmail(hashedEmail)
        } catch (e: Throwable) {
            logger.info("User $hashedEmail not found, defaulting to super-user=false")

            // By default, a user not found is not super-user
            UserAuthorization(
                hashedEmail = hashedEmail,
                isSuperUser = false,
            )
        }
    }
}
