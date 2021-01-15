package fr.gouv.cnsp.monitorfish.infrastructure.api

import io.swagger.annotations.ApiOperation
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class FrontController {

    @GetMapping("/auth-callback", "/home")
    @ApiOperation("Get the Single Page Application index file")
    fun redirectToSPA() : String {
        return "index.html"
    }

    @GetMapping(value = ["/**/{path:[^\\.]*}"])
    fun forward(): String? {
        return "forward:/"
    }
}