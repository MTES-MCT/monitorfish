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
        /**
         * If the path is not super-user protected, authorize any logged user
         */
        if (!isContainingSuperUserPath) {
            return true
        }

        val hashedEmail = hash(email)

        val userAuthorization = try {
            userAuthorizationRepository.findByHashedEmail(hashedEmail)
        } catch (e: Throwable) {
            /**
             * If the user is not found in the `UserAuthorizationRepository`, reject
             */
            return false
        }

        return userAuthorization.isSuperUser
    }
}
