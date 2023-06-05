package fr.gouv.cnsp.monitorfish.infrastructure.api.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletRequestWrapper
import java.util.*
import kotlin.collections.HashMap
import kotlin.collections.HashSet

internal class MutableHttpServletRequest(request: HttpServletRequest?) : HttpServletRequestWrapper(request) {
    private val customHeaders: MutableMap<String, String>

    init {
        customHeaders = HashMap()
    }

    fun putHeader(name: String, value: String) {
        customHeaders[name] = value
    }

    override fun getHeader(name: String): String {
        // check the custom headers first
        val headerValue = customHeaders[name]
        return headerValue ?: (request as HttpServletRequest).getHeader(name)
        // else return from into the original wrapped object
    }

    override fun getHeaderNames(): Enumeration<String> {
        // create a set of the custom header names
        val set: MutableSet<String> = HashSet(customHeaders.keys)

        // now add the headers from the wrapped request object
        val e = (request as HttpServletRequest).headerNames
        while (e.hasMoreElements()) {
            // add the names of the request headers into the list
            val n = e.nextElement()
            set.add(n)
        }

        // create an enumeration from the set and return
        return Collections.enumeration(set)
    }
}
