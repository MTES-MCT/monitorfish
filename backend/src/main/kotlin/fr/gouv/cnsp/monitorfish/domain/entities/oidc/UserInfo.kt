package fr.gouv.cnsp.monitorfish.domain.entities.oidc

import kotlinx.serialization.Serializable

@Serializable
data class UserInfo(val email: String)
