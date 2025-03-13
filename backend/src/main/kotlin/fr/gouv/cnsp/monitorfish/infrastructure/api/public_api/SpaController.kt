package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import jakarta.servlet.RequestDispatcher
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
 * This controller redirects all unhandled routes by the backend to our SPA frontend
 */
@Controller
class SpaController : ErrorController {
    private val logger = LoggerFactory.getLogger(SpaController::class.java)

    companion object {
        val FRONTEND_APP_ROUTES =
            listOf(
                "/backoffice",
                "/backoffice/**",
                "/ext",
                "/light",
                "/load_light",
                "/login",
                "/register",
                "/side_window",
            )
    }

    private fun isStaticResource(path: String): Boolean =
        path.matches(
            """.*\.(js|mjs|css|json|map|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|txt|eot|otf|ico|xml)$""".toRegex(),
        )

    @RequestMapping("/error")
    fun error(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): Any {
        val path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI) as? String ?: "unknown"
        val errorMessage = request.getAttribute(RequestDispatcher.ERROR_MESSAGE) as? String ?: "Unknown error"
        val status = response.status

        // Prevent returning index.html for failed asset requests
        if (isStaticResource(path)) {
            logger.warn("API error or asset not found: $path (status: $status)")
            response.status = HttpStatus.NOT_FOUND.value()
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                    mapOf(
                        "error" to errorMessage,
                        "path" to path,
                        "status" to status,
                    ),
                )
        }

        // Prevent returning index.html for failed API requests
        // "/light/v1" is used to avoid clashes with the /light frontend route
        if (path.startsWith("/bff") || path.startsWith("/api") || path.startsWith("/light/v1")) {
            logger.error("API error: $path ($status): $errorMessage")

            return ResponseEntity
                .status(status)
                .body(
                    mapOf(
                        "error" to errorMessage,
                        "path" to path,
                        "status" to status,
                    ),
                )
        }

        // Else, it might be a frontend path
        response.status = HttpStatus.OK.value()
        return "forward:/index.html"
    }

    val errorPath: String
        get() = "/error"
}
