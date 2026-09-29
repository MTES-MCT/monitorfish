package fr.gouv.cnsp.monitorfish.domain.use_cases.user_layers

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import fr.gouv.cnsp.monitorfish.domain.hash
import fr.gouv.cnsp.monitorfish.domain.repositories.UserLayersRepository

@UseCase
class GetUserLayers(
    private val userLayersRepository: UserLayersRepository,
) {
    fun execute(email: String): UserLayers? = userLayersRepository.findByHashedEmail(hash(email))
}
