package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.oidc.UserInfo

interface OIDCRepository {
    fun getUserInfo(authorizationHeaderContent: String): UserInfo
}
