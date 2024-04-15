package fr.gouv.cnsp.monitorfish.infrastructure.api

import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.MethodParameter
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpMethod
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter
import java.lang.reflect.Type

@ControllerAdvice
class HttpUpdateLogging : RequestBodyAdviceAdapter() {
    @Autowired
    var httpServletRequest: HttpServletRequest? = null

    override fun supports(
        methodParameter: MethodParameter,
        targetType: Type,
        aClass: Class<out HttpMessageConverter<*>>,
    ): Boolean {
        return true
    }

    override fun afterBodyRead(
        body: Any,
        inputMessage: HttpInputMessage,
        parameter: MethodParameter,
        targetType: Type,
        converterType: Class<out HttpMessageConverter<*>>,
    ): Any {
        println(httpServletRequest!!.method)
        if (httpServletRequest?.method != HttpMethod.PUT.name() && httpServletRequest?.method != HttpMethod.POST.name()) {
            return super.afterBodyRead(body, inputMessage, parameter, targetType, converterType)
        }

        RequestLogging.logRequest(httpServletRequest, body)

        return super.afterBodyRead(body, inputMessage, parameter, targetType, converterType)
    }
}
