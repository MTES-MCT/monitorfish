package fr.gouv.cnsp.monitorfish.infrastructure.api.log

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import java.util.*

class LoggingFormatter {
    companion object {
        fun formatRequest(
            mapper: ObjectMapper,
            httpServletRequest: HttpServletRequest?,
            body: Any? = null,
        ): String? {
            if (httpServletRequest == null) {
                return null
            }

            val stringBuilder = StringBuilder()
            val parameters = buildParametersString(httpServletRequest)

            stringBuilder.append("REQUEST ")
            stringBuilder.append(httpServletRequest.method).append(" ")
            stringBuilder.append(httpServletRequest.requestURI)
            if (parameters.isNotEmpty()) {
                stringBuilder.append(parameters).append(" ")
            } else {
                stringBuilder.append(" ")
            }
            stringBuilder.append(buildHeadersMap(httpServletRequest)).append(" ")

            if (body != null) {
                stringBuilder.append(mapper.writeValueAsString(body))
            }

            return stringBuilder.toString()
        }

        fun formatResponse(
            mapper: ObjectMapper,
            httpServletRequest: HttpServletRequest,
            httpServletResponse: HttpServletResponse,
            body: Any?,
        ): String {
            val stringBuilder = StringBuilder()

            stringBuilder.append("RESPONSE ")
            stringBuilder.append(httpServletRequest.method).append(" ")
            stringBuilder.append(httpServletResponse.status).append(" ")
            stringBuilder.append(httpServletRequest.requestURI).append(" ")

            if (body != null) {
                stringBuilder.append(mapper.writeValueAsString(body))
            }

            return stringBuilder.toString()
        }

        private fun buildParametersString(httpServletRequest: HttpServletRequest): String {
            val parameterBuilder = StringBuilder()
            val parameterNames = httpServletRequest.parameterNames

            if (!parameterNames.hasMoreElements()) {
                return ""
            }

            while (parameterNames.hasMoreElements()) {
                val key = parameterNames.nextElement()
                val value = httpServletRequest.getParameter(key)

                if (parameterBuilder.isNotEmpty()) {
                    parameterBuilder.append("&")
                }

                parameterBuilder.append("$key=$value")
            }

            return "?$parameterBuilder"
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
