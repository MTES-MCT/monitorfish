package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.findByHashedEmailOrNull

@UseCase
class GetIsAuthorizedUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(
        email: String,
        isSuperUserPath: Boolean,
        isAdministratorPath: Boolean,
    ): Boolean {
        if (!isSuperUserPath && !isAdministratorPath) {
            return true
        }

        val userAuthorization = userAuthorizationRepository.findByHashedEmailOrNull(hash(email)) ?: return false

        if (isAdministratorPath) {
            return userAuthorization.isSuperUser && userAuthorization.isAdministrator
        }

        return userAuthorization.isSuperUser
    }
}
