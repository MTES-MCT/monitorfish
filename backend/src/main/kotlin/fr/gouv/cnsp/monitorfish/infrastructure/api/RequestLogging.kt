package fr.gouv.cnsp.monitorfish.infrastructure.api

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import java.util.*

class RequestLogging {
    companion object {
        private val logger = LoggerFactory.getLogger(RequestLogging::class.java)
        private val mapper = ObjectMapper()

        fun logRequest(httpServletRequest: HttpServletRequest?, body: Any?) {
            if (httpServletRequest == null) {
                return
            }

            val stringBuilder = StringBuilder()
            val parameters = buildParametersString(httpServletRequest)

            stringBuilder.append("REQUEST ")
            stringBuilder.append(httpServletRequest.method).append(" ")
            stringBuilder.append(httpServletRequest.requestURI)
            if (parameters.isNotEmpty()) {
                stringBuilder.append(parameters).append(" ")
            }
            stringBuilder.append(buildHeadersMap(httpServletRequest)).append(" ")

            if (body != null) {
                println(body)
                println(mapper.writeValueAsString(body))
                stringBuilder.append(mapper.writeValueAsString(body))
            }

            logger.info(stringBuilder.toString())
        }

        fun logResponse(httpServletRequest: HttpServletRequest, httpServletResponse: HttpServletResponse, body: Any?) {
            val stringBuilder = StringBuilder()

            stringBuilder.append("RESPONSE ")
            stringBuilder.append(httpServletRequest.method).append(" ")
            stringBuilder.append(httpServletRequest.requestURI).append(" ")
            stringBuilder.append(mapper.writeValueAsString(body)).append(" ")

            logger.info(stringBuilder.toString())
        }

        private fun buildParametersString(httpServletRequest: HttpServletRequest): String {
            val parameterBuilder = StringBuilder()
            val parameterNames = httpServletRequest.parameterNames

            while (parameterNames.hasMoreElements()) {
                val key = parameterNames.nextElement()
                val value = httpServletRequest.getParameter(key)

                if (parameterBuilder.isNotEmpty()) {
                    parameterBuilder.append("&")
                }

                parameterBuilder.append("$key=$value")
            }

            return "?${parameterBuilder}"
        }

        private fun buildHeadersMap(request: HttpServletRequest): Map<String, String> {
            val map: MutableMap<String, String> = HashMap()

            val headerNames: Enumeration<*> = request.headerNames
            while (headerNames.hasMoreElements()) {
                val key = headerNames.nextElement() as String
                val value = request.getHeader(key)
                map[key] = value
            }

            return map
        }
    }
}
