package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.AddAuthorizedOrganizationalUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.DeleteAuthorizedOrganizationalUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.authorization.GetAllAuthorizedOrganizationalUnits
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.AuthorizedOrganizationalUnitDataInput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * Organizational units contain slashes (i.e. `DAM/DPMA`), hence they are passed as query parameters or body.
 */
@RestController
@RequestMapping("/bff/v1/admin/authorized_organizational_units")
@Tag(name = "APIs for administration of authorized organizational units (Cerbère)")
class AuthorizedOrganizationalUnitAdminController(
    private val getAllAuthorizedOrganizationalUnits: GetAllAuthorizedOrganizationalUnits,
    private val addAuthorizedOrganizationalUnit: AddAuthorizedOrganizationalUnit,
    private val deleteAuthorizedOrganizationalUnit: DeleteAuthorizedOrganizationalUnit,
) {
    @GetMapping("")
    @Operation(summary = "Get all authorized organizational units")
    fun getAll(): List<String> = getAllAuthorizedOrganizationalUnits.execute()

    @PostMapping(value = [""], consumes = ["application/json"])
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add an authorized organizational unit")
    fun add(
        @RequestBody
        authorizedOrganizationalUnitDataInput: AuthorizedOrganizationalUnitDataInput,
        @AuthenticationPrincipal principal: OidcUser?,
    ) = addAuthorizedOrganizationalUnit.execute(
        authorizedOrganizationalUnitDataInput.organizationalUnit,
        principal?.email,
    )

    @DeleteMapping("")
    @Operation(summary = "Delete an authorized organizational unit")
    fun delete(
        @Parameter(description = "Organizational unit")
        @RequestParam(name = "organizationalUnit")
        organizationalUnit: String,
        @AuthenticationPrincipal principal: OidcUser?,
    ) = deleteAuthorizedOrganizationalUnit.execute(organizationalUnit, principal?.email)
}
