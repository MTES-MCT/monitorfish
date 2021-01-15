package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.fasterxml.jackson.databind.ObjectMapper
import io.swagger.annotations.ApiOperation
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.web.error.ErrorAttributeOptions
import org.springframework.boot.web.servlet.error.ErrorAttributes
import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.context.request.WebRequest
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Controller
class FrontController : ErrorController {

    private val logger = LoggerFactory.getLogger(FrontController::class.java)

    @GetMapping("/auth-callback", "/home")
    @ApiOperation("Get the Single Page Application index file")
    fun redirectToSPA() : String {
        return "index.html"
    }

    private val requestURIAttribute = "javax.servlet.forward.request_uri"

    @Autowired
    private val errorAttributes: ErrorAttributes? = null

    private val api = "api"
    private val bff = "bff"

    @RequestMapping(value = ["/error"])
    fun errorHandler(request: HttpServletRequest, webRequest: WebRequest, response: HttpServletResponse): String {
        val requestURI = request.getAttribute(requestURIAttribute)

        return if(requestURI.toString().contains(api) || requestURI.toString().contains(bff)) {
            val errorJSON = getErrorJSON(webRequest)
            logger.error(errorJSON)
            buildErrorResponse(response, errorJSON)
            ""
        } else {
            response.status = HttpStatus.OK.value()
            logger.debug("Forwarding to index.html...")
            "forward:/index.html"
        }
    }

    private fun buildErrorResponse(response: HttpServletResponse, errorJSON: String?) {
        val out = response.writer
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        out.print(errorJSON)
        out.flush()
    }

    private fun getErrorJSON(webRequest: WebRequest): String? {
        val mapper = ObjectMapper()
        return mapper.writeValueAsString(getErrorAttributes(webRequest, ErrorAttributeOptions.of(ErrorAttributeOptions.Include.STACK_TRACE)))
    }

    private fun getErrorAttributes(webRequest: WebRequest, options: ErrorAttributeOptions): Map<String, Any> {
        return errorAttributes!!.getErrorAttributes(webRequest, options)
    }

    override fun getErrorPath(): String {
        return "/error"
    }
}