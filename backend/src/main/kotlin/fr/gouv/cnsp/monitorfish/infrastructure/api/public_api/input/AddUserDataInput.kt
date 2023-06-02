package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

data class AddUserDataInput(
    val email: String,
    val isSuperUser: Boolean,
)
