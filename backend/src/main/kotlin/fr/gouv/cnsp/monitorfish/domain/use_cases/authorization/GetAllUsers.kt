package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

@UseCase
class GetAllUsers(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(): List<UserAuthorization> = userAuthorizationRepository.findAll()
}
