package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

@UseCase
class DeleteUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(email: String) {
        val hashedEmail = hash(email)

        userAuthorizationRepository.delete(hashedEmail)
    }
}
