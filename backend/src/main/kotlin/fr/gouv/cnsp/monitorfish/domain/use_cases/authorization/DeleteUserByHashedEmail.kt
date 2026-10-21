package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

/**
 * Users created before plain emails were stored can only be identified by their hashed email.
 */
@UseCase
class DeleteUserByHashedEmail(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(hashedEmail: String) {
        userAuthorizationRepository.delete(hashedEmail)
    }
}
