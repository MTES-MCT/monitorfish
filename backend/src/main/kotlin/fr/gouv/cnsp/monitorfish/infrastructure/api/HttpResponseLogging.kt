package fr.gouv.cnsp.monitorfish.infrastructure.api

import org.springframework.core.MethodParameter
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.http.server.ServletServerHttpRequest
import org.springframework.http.server.ServletServerHttpResponse
import org.springframework.lang.Nullable
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice

@ControllerAdvice
class HttpResponseLogging : ResponseBodyAdvice<Any> {
    override fun supports(methodParameter: MethodParameter, aClass: Class<out HttpMessageConverter<*>>): Boolean {
        return true
    }

    override fun beforeBodyWrite(
        @Nullable body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse,
    ): Any? {
        println(request.method)
        if (request.method != HttpMethod.PUT && request.method != HttpMethod.POST) {
            return body
        }

        if (request is ServletServerHttpRequest && response is ServletServerHttpResponse) {
            RequestLogging.logResponse(
                request.servletRequest,
                response.servletResponse,
                body,
            )
        }

        return body
    }
}
