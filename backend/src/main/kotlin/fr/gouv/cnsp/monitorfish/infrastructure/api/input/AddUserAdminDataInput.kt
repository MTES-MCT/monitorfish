package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration

data class AddUserAdminDataInput(
    val email: String,
    val isSuperUser: Boolean,
    val isAdministrator: Boolean = false,
    val service: CnspService? = null,
    val administration: ExternalAdministration? = null,
)
