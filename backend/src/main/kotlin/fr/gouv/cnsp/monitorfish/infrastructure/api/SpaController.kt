package fr.gouv.cnsp.monitorfish.infrastructure.api

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
    fun error(request: HttpServletRequest, response: HttpServletResponse): Any {
        response.status = HttpStatus.OK.value()
        return "forward:/index.html"
    }

    val errorPath: String
        get() = "/error"
}
