package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.core.MethodParameter
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpMethod.POST
import org.springframework.http.HttpMethod.PUT
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter
import java.lang.reflect.Type

@ControllerAdvice
class LogRequestsWithBody(val request: HttpServletRequest, val mapper: ObjectMapper) : RequestBodyAdviceAdapter() {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    override fun afterBodyRead(
        body: Any,
        inputMessage: HttpInputMessage,
        parameter: MethodParameter,
        targetType: Type,
        converterType: Class<out HttpMessageConverter<*>>,
    ): Any {
        if (request.method == PUT.name() || request.method == POST.name()) {
            val requestLog = LoggingFormatter.formatRequest(mapper, request, body)
            requestLog?.let { logger.info(it) }
        }

        return super.afterBodyRead(body, inputMessage, parameter, targetType, converterType)
    }

    override fun supports(
        methodParameter: MethodParameter,
        targetType: Type,
        converterType: Class<out HttpMessageConverter<*>>,
    ): Boolean {
        return true
    }
}
