package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.ReplacedAdministrationUsers

data class ReplacedAdministrationUsersDataOutput(
    val addedEmails: List<String>,
    val removedEmails: List<String>,
    val ignoredSuperUserEmails: List<String>,
) {
    companion object {
        fun fromReplacedAdministrationUsers(replacedAdministrationUsers: ReplacedAdministrationUsers) =
            ReplacedAdministrationUsersDataOutput(
                addedEmails = replacedAdministrationUsers.addedEmails,
                removedEmails = replacedAdministrationUsers.removedEmails,
                ignoredSuperUserEmails = replacedAdministrationUsers.ignoredSuperUserEmails,
            )
    }
}
