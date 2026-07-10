package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.SaveUser
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input.AddUserDataInput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/authorization/management")
@Tag(name = "APIs for management of user authorizations")
class UserManagementController(
    private val saveUser: SaveUser,
    private val deleteUser: DeleteUser,
) {
    @PostMapping(value = [""], consumes = ["application/json"])
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user")
    fun saveUser(
        @RequestBody
        user: AddUserDataInput,
    ) = saveUser.execute(
        email = user.email,
        isSuperUser = user.isSuperUser,
        service = user.service,
        isAdministrator = user.isAdministrator,
    )

    @DeleteMapping(value = ["/{email}"])
    @Operation(summary = "Delete a given user")
    fun deleteUser(
        @PathParam("User email")
        @PathVariable(name = "email")
        email: String,
    ) = deleteUser.execute(email)
}
