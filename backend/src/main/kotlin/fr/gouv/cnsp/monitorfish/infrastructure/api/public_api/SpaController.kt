package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
 * This controller redirects all unhandled routes by the backend to our SPA frontend
 */
@Controller
class SpaController : ErrorController {
    @RequestMapping("/error")
    fun error(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): Any {
        val appPaths = listOf(
            "/backoffice",
            "/side_window",
            "/login",
            "/register",
            "/backoffice/**",
            "/ext",
            "/light",
            "/load_light"
        )

        if (response.status != HttpStatus.UNAUTHORIZED.value() &&
            appPaths.any { path -> request.requestURI.contains(path) } ) {
            response.status = HttpStatus.OK.value()
            return "forward:/index.html"
        }

        return response
    }

    val errorPath: String
        get() = "/error"
}
