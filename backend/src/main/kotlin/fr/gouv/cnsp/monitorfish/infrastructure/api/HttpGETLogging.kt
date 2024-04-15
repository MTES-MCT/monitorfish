package fr.gouv.cnsp.monitorfish.infrastructure.api

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.boot.web.servlet.DispatcherType
import org.springframework.http.HttpMethod
import org.springframework.web.servlet.HandlerInterceptor
import java.util.*

class HttpGETLogging : HandlerInterceptor {
    @Throws(Exception::class)
    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        if (request.dispatcherType.name == DispatcherType.REQUEST.name && request.method == HttpMethod.GET.name()) {
            RequestLogging.logRequest(request, null)
        }

        return true
    }
}
