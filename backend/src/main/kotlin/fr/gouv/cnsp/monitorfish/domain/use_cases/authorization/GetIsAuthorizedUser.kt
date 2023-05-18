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

    fun execute(email: String): Boolean {
        return try {
            val hashedEmail = hash(email)

            return userAuthorizationRepository.findByHashedEmail(hashedEmail).isSuperUser
        } catch (e: Throwable) {
            false
        }
    }
}
