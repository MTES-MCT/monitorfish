package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.ExternalAdministration
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.AddUser
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteUserByHashedEmail
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllUsers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.ReplaceAdministrationUsers
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.UpdateUserIsAdministrator
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AddUserAdminDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ReplaceAdministrationUsersDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateUserIsAdministratorDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ReplacedAdministrationUsersDataOutput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.UserAuthorizationDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/admin/users")
@Tag(name = "APIs for administration of users")
class UserAdminController(
    private val getAllUsers: GetAllUsers,
    private val addUser: AddUser,
    private val replaceAdministrationUsers: ReplaceAdministrationUsers,
    private val updateUserIsAdministrator: UpdateUserIsAdministrator,
    private val deleteUserByHashedEmail: DeleteUserByHashedEmail,
) {
    @GetMapping("")
    @Operation(summary = "Get all users")
    fun getAll(): List<UserAuthorizationDataOutput> =
        getAllUsers.execute().map { UserAuthorizationDataOutput.fromUserAuthorization(it) }

    @PostMapping(value = [""], consumes = ["application/json"])
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a user")
    fun add(
        @RequestBody
        addUserAdminDataInput: AddUserAdminDataInput,
    ) = addUser.execute(
        email = addUserAdminDataInput.email,
        isSuperUser = addUserAdminDataInput.isSuperUser,
        isAdministrator = addUserAdminDataInput.isAdministrator,
        service = addUserAdminDataInput.service,
        administration = addUserAdminDataInput.administration,
    )

    @PutMapping(value = ["/administrations/{administration}"], consumes = ["application/json"])
    @Operation(summary = "Replace the users of an external administration by a list of emails")
    fun replaceAdministrationUsers(
        @PathVariable(name = "administration")
        administration: ExternalAdministration,
        @RequestBody
        replaceAdministrationUsersDataInput: ReplaceAdministrationUsersDataInput,
    ): ReplacedAdministrationUsersDataOutput {
        val replacedAdministrationUsers =
            replaceAdministrationUsers.execute(administration, replaceAdministrationUsersDataInput.emails)

        return ReplacedAdministrationUsersDataOutput.fromReplacedAdministrationUsers(replacedAdministrationUsers)
    }

    @PutMapping(value = ["/{hashedEmail}/administrator"], consumes = ["application/json"])
    @Operation(summary = "Grant or remove the administrator rights of a user")
    fun updateIsAdministrator(
        @PathVariable(name = "hashedEmail")
        hashedEmail: String,
        @RequestBody
        updateUserIsAdministratorDataInput: UpdateUserIsAdministratorDataInput,
        @AuthenticationPrincipal principal: OidcUser?,
    ) = updateUserIsAdministrator.execute(
        hashedEmail = hashedEmail,
        isAdministrator = updateUserIsAdministratorDataInput.isAdministrator,
        currentUserEmail = principal?.email,
    )

    @DeleteMapping("/{hashedEmail}")
    @Operation(summary = "Delete a user")
    fun delete(
        @PathVariable(name = "hashedEmail")
        hashedEmail: String,
    ) = deleteUserByHashedEmail.execute(hashedEmail)
}
