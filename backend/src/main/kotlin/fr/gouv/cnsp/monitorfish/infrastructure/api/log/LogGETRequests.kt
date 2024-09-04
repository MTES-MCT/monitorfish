package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpMethod.GET
import org.springframework.web.servlet.HandlerInterceptor

class LogGETRequests(val mapper: ObjectMapper) : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        if (request.method == GET.name()) {
            val requestLog = LoggingFormatter.formatRequest(mapper, request)
            requestLog?.let { logger.info(it) }
        }

        return true
    }
}
