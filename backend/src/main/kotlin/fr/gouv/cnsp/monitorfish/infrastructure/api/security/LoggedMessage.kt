package fr.gouv.cnsp.monitorfish.infrastructure.api.security

class LoggedMessage(private val message: String, private val hashedUsername: String, val url: String) {
    override fun toString(): String {
        return "{" +
            "\"message\": \"" + message + "\"," +
            "\"hashedUsername\": \"" + hashedUsername + "\"," +
            "\"URL\": \"" + url + "\"" +
            '}'
    }
}
