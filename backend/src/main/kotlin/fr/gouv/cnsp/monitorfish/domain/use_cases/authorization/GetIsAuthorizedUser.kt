package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import org.slf4j.LoggerFactory

@UseCase
class GetIsAuthorizedUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    private val logger = LoggerFactory.getLogger(GetIsAuthorizedUser::class.java)

    fun execute(email: String, isContainingSuperUserPath: Boolean): Boolean {
        val hashedEmail = hash(email)

        val userAuthorization = try {
            userAuthorizationRepository.findByHashedEmail(hashedEmail)
        } catch (e: Throwable) {
            return false
        }

        return when (isContainingSuperUserPath) {
            true -> userAuthorization.isSuperUser
            /**
             * For not super-user paths, if the user is not found the method `findByHashedEmail`
             * should already have thrown an exception.
             */
            false -> return true
        }
    }
}
