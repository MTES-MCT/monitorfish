package fr.gouv.cnsp.monitorfish.domain.use_cases.authorization

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.UserAuthorization
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserAuthorizationRepository

@UseCase
class SaveUser(
    private val userAuthorizationRepository: UserAuthorizationRepository,
) {
    fun execute(
        email: String,
        isSuperUser: Boolean,
        service: String?,
        isAdministrator: Boolean,
        administration: ExternalAdministration? = null,
    ) {
        val user =
            UserAuthorization(
                hashedEmail = hash(email),
                email = email.trim().lowercase(),
                isSuperUser = isSuperUser,
                service = service?.let { CnspService.fromValue(it) },
                isAdministrator = isAdministrator,
                administration = administration,
            )

        userAuthorizationRepository.upsert(user)
    }
}
