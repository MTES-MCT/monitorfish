package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.core.MethodParameter
import org.springframework.http.HttpMethod.POST
import org.springframework.http.HttpMethod.PUT
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.http.server.ServletServerHttpRequest
import org.springframework.http.server.ServletServerHttpResponse
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice

@ControllerAdvice
class LogResponseWithBody(val mapper: ObjectMapper) : ResponseBodyAdvice<Any?> {
    private val logger = LoggerFactory.getLogger(LogGETRequests::class.java)

    override fun supports(returnType: MethodParameter, converterType: Class<out HttpMessageConverter<*>>): Boolean {
        return true
    }

    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse,
    ): Any? {
        if (request.method == PUT || request.method == POST) {
            val requestLog = LoggingFormatter.formatResponse(
                mapper,
                (request as ServletServerHttpRequest).servletRequest,
                (response as ServletServerHttpResponse).servletResponse,
                body,
            )
            logger.info(requestLog)
        }

        return body
    }
}
