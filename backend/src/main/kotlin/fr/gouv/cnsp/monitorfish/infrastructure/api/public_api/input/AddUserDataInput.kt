package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration

data class AddUserDataInput(
    val email: String,
    val isSuperUser: Boolean,
    val service: String? = null,
    val isAdministrator: Boolean,
    val administration: ExternalAdministration? = null,
)
