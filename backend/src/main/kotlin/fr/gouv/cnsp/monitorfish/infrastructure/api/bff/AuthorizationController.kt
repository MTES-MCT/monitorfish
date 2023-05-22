package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/authorization")
@Tag(name = "APIs for authorization")
class AuthorizationController {

    /**
     * This controller will
     *   - return 200 (true) if it passes the filter `UserAuthorizationCheckFilter`
     *   - return an 401 if it does not passes the filter `UserAuthorizationCheckFilter`
     * Hence, no use-case is required
     */
    @GetMapping("is_super_user")
    @Operation(summary = "Check if current logged user is super user")
    fun getIsSuperUser() {}
}
