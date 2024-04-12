import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.web.servlet.HandlerInterceptor
import java.util.*

/**
 * A webflow request interceptor injecting correlation id to the request context.
 */
class CorrelationInterceptor : HandlerInterceptor {
    companion object {
        private const val CORRELATION_ID_HEADER_NAME = "X-Correlation-Id"
        private const val CORRELATION_ID_LOG_VAR_NAME = "correlationId"
    }

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        val correlationId = getCorrelationIdFromHeader(request)
        MDC.put(CORRELATION_ID_LOG_VAR_NAME, correlationId)

        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?,
    ) {
        MDC.remove(CORRELATION_ID_LOG_VAR_NAME)
    }

    private fun getCorrelationIdFromHeader(request: HttpServletRequest): String {
        var correlationId = request.getHeader(CORRELATION_ID_HEADER_NAME)

        if (correlationId.isNullOrEmpty()) {
            correlationId = generateUniqueCorrelationId()
        }

        return correlationId
    }

    private fun generateUniqueCorrelationId(): String {
        return UUID.randomUUID().toString()
    }
}
