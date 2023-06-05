package fr.gouv.cnsp.monitorfish.infrastructure.api.security.input

import kotlinx.serialization.Serializable

@Serializable
data class UserInfo(val email: String)
