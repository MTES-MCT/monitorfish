package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

@UseCase
class SaveUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(email: String, isSuperUser: Boolean) {
        val user = UserAuthorization(
            hashedEmail = hash(email),
            isSuperUser = isSuperUser,
        )

        userAuthorizationRepository.save(user)
    }
}
